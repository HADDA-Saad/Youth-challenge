package com.youthchallenge.auth.service;

import com.youthchallenge.auth.dto.AuthResponse;
import com.youthchallenge.auth.dto.LoginRequest;
import com.youthchallenge.auth.dto.RegisterRequest;
import com.youthchallenge.auth.dto.GoogleLoginRequest;
import com.youthchallenge.common.exception.ApiException;
import com.youthchallenge.user.model.User;
import com.youthchallenge.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw ApiException.badRequest("Email is already taken");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw ApiException.badRequest("Username is already taken");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .xp(0)
                .level("Beginner")
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getDisplayName())
                .email(user.getEmail())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            throw new ApiException("Invalid credentials", HttpStatus.UNAUTHORIZED);
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("Invalid credentials", HttpStatus.UNAUTHORIZED));

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getDisplayName())
                .email(user.getEmail())
                .build();
    }

    @Transactional
    public AuthResponse googleLogin(GoogleLoginRequest request) {
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + request.getToken();

        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> payload = response.getBody();
                String email = (String) payload.get("email");
                String name = (String) payload.get("name");
                String picture = (String) payload.get("picture");

                if (email == null) {
                    throw new ApiException("Google token did not provide an email", HttpStatus.BAD_REQUEST);
                }

                // Find user by email or create new
                User user = userRepository.findByEmail(email).orElseGet(() -> {
                    String baseUsername = name != null ? name.replaceAll("\\s+", "").toLowerCase() : email.split("@")[0];
                    String finalUsername = baseUsername;
                    int suffix = 1;
                    
                    // Ensure unique username
                    while (userRepository.existsByUsername(finalUsername)) {
                        finalUsername = baseUsername + suffix;
                        suffix++;
                    }

                    User newUser = User.builder()
                            .username(finalUsername)
                            .email(email)
                            .password(passwordEncoder.encode(UUID.randomUUID().toString())) // Random password for oauth users
                            .xp(0)
                            .level("Beginner")
                            .avatarUrl(picture)
                            .build();
                    return userRepository.save(newUser);
                });

                String jwtToken = jwtService.generateToken(user);

                return AuthResponse.builder()
                        .token(jwtToken)
                        .userId(user.getId())
                        .username(user.getDisplayName())
                        .email(user.getEmail())
                        .build();

            } else {
                throw new ApiException("Invalid Google token", HttpStatus.UNAUTHORIZED);
            }
        } catch (Exception e) {
            throw new ApiException("Failed to authenticate with Google: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }
}
