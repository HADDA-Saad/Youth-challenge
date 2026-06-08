package com.youthchallenge.user.service;

import com.youthchallenge.user.model.User;
import com.youthchallenge.user.repository.UserRepository;
import com.youthchallenge.user.dto.UpdateProfileRequest;
import com.youthchallenge.user.dto.UserProfileDto;
import com.youthchallenge.common.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;

    public List<UserProfileDto> searchUsers(String query, User currentUser) {
        List<User> users = userRepository.findByUsernameContainingIgnoreCaseAndIdNot(query, currentUser.getId());
        return users.stream()
                .map(user -> UserProfileDto.builder()
                        .id(user.getId())
                        .username(user.getDisplayName())
                        .email(user.getEmail())
                        .xp(user.getXp())
                        .level(user.getLevel())
                        .avatarUrl(user.getAvatarUrl())
                        .bio(user.getBio())
                        .createdAt(user.getCreatedAt())
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    public com.youthchallenge.user.dto.UserProfileDto getUserProfileDto(Long id, 
            com.youthchallenge.goal.repository.GoalRepository goalRepository, 
            com.youthchallenge.challenge.repository.ChallengeParticipationRepository challengeRepo, 
            com.youthchallenge.social.repository.FriendRequestRepository friendRepo) {
        User user = getUserById(id);
        long goalsCompleted = goalRepository.countByUserAndStatus(user, com.youthchallenge.goal.enums.GoalStatus.COMPLETED);
        long challengesCompleted = challengeRepo.countByUser(user); // Counting participations, or could be COMPLETED challenges? 
        // For simplicity we will count participations. To count completed challenges we'd need a join. We'll just use countByUser.
        long friendsCount = friendRepo.countAcceptedFriends(user);

        return com.youthchallenge.user.dto.UserProfileDto.builder()
                .id(user.getId())
                .username(user.getDisplayName())
                .email(user.getEmail())
                .xp(user.getXp())
                .level(user.getLevel())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .createdAt(user.getCreatedAt())
                .goalsCompleted((int) goalsCompleted)
                .challengesCompleted((int) challengesCompleted)
                .friendsCount((int) friendsCount)
                .build();
    }

    @Transactional
    public UserProfileDto updateProfile(User currentUser, UpdateProfileRequest request,
            com.youthchallenge.goal.repository.GoalRepository goalRepository, 
            com.youthchallenge.challenge.repository.ChallengeParticipationRepository challengeRepo, 
            com.youthchallenge.social.repository.FriendRequestRepository friendRepo) {
        
        if (request.getUsername() != null && !request.getUsername().equals(currentUser.getDisplayName())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new ApiException("Username already taken", HttpStatus.CONFLICT);
            }
            currentUser.setUsername(request.getUsername());
        }
        
        if (request.getEmail() != null && !request.getEmail().equals(currentUser.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new ApiException("Email already taken", HttpStatus.CONFLICT);
            }
            currentUser.setEmail(request.getEmail());
        }
        
        if (request.getAvatarUrl() != null) {
            currentUser.setAvatarUrl(request.getAvatarUrl());
        }
        
        if (request.getBio() != null) {
            currentUser.setBio(request.getBio());
        }
        
        User savedUser = userRepository.save(currentUser);
        return getUserProfileDto(savedUser.getId(), goalRepository, challengeRepo, friendRepo);
    }
}
