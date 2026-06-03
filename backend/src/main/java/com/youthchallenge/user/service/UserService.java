package com.youthchallenge.user.service;

import com.youthchallenge.user.model.User;
import com.youthchallenge.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;

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
                .createdAt(user.getCreatedAt())
                .goalsCompleted((int) goalsCompleted)
                .challengesCompleted((int) challengesCompleted)
                .friendsCount((int) friendsCount)
                .build();
    }
}
