package com.youthchallenge.user.controller;

import com.youthchallenge.badge.dto.BadgeDto;
import com.youthchallenge.badge.service.BadgeService;
import com.youthchallenge.common.dto.ApiResponse;
import com.youthchallenge.user.dto.UserProfileDto;
import com.youthchallenge.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.youthchallenge.challenge.repository.ChallengeParticipationRepository;
import com.youthchallenge.goal.enums.GoalStatus;
import com.youthchallenge.goal.repository.GoalRepository;
import com.youthchallenge.social.service.FriendService;
import com.youthchallenge.user.service.UserService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final BadgeService badgeService;
    private final UserService userService;
    private final GoalRepository goalRepository;
    private final ChallengeParticipationRepository participationRepository;
    private final FriendService friendService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileDto>> getMyProfile(@AuthenticationPrincipal User user) {
        UserProfileDto profile = UserProfileDto.builder()
                .id(user.getId())
                .username(user.getDisplayName())
                .email(user.getEmail())
                .xp(user.getXp())
                .level(user.getLevel())
                .avatarUrl(user.getAvatarUrl())
                .createdAt(user.getCreatedAt())
                .goalsCompleted(goalRepository.countByUserAndStatus(user, GoalStatus.COMPLETED))
                .challengesCompleted(participationRepository.countByUser(user))
                .friendsCount((long) friendService.getAcceptedFriends(user).size())
                .build();

        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @GetMapping("/{id}/badges")
    public ResponseEntity<ApiResponse<List<BadgeDto>>> getUserBadges(@PathVariable Long id) {
        List<BadgeDto> badges = badgeService.getUserBadges(id);
        return ResponseEntity.ok(ApiResponse.success(badges));
    }

    @GetMapping("/me/badges")
    public ResponseEntity<ApiResponse<List<BadgeDto>>> getMyBadges(@AuthenticationPrincipal User user) {
        List<BadgeDto> badges = badgeService.getUserBadges(user.getId());
        return ResponseEntity.ok(ApiResponse.success(badges));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserProfileDto>> getUserProfile(@PathVariable Long id) {
        User user = userService.getUserById(id);
        UserProfileDto profile = UserProfileDto.builder()
                .id(user.getId())
                .username(user.getDisplayName())
                .email(user.getEmail())
                .xp(user.getXp())
                .level(user.getLevel())
                .avatarUrl(user.getAvatarUrl())
                .createdAt(user.getCreatedAt())
                .goalsCompleted(goalRepository.countByUserAndStatus(user, GoalStatus.COMPLETED))
                .challengesCompleted(participationRepository.countByUser(user))
                .friendsCount((long) friendService.getAcceptedFriends(user).size())
                .build();

        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @GetMapping("/{id}/friends/status")
    public ResponseEntity<ApiResponse<Map<String, String>>> getFriendshipStatus(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long id) {
        User targetUser = userService.getUserById(id);
        String status = friendService.getFriendshipStatus(currentUser, targetUser);
        return ResponseEntity.ok(ApiResponse.success(Map.of("status", status)));
    }
}
