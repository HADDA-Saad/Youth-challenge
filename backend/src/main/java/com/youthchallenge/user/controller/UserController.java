package com.youthchallenge.user.controller;

import com.youthchallenge.badge.dto.BadgeDto;
import com.youthchallenge.badge.service.BadgeService;
import com.youthchallenge.challenge.repository.ChallengeParticipationRepository;
import com.youthchallenge.common.dto.ApiResponse;
import com.youthchallenge.goal.repository.GoalRepository;
import com.youthchallenge.social.dto.FriendshipStatusDto;
import com.youthchallenge.social.repository.FriendRequestRepository;
import com.youthchallenge.social.service.FriendService;
import com.youthchallenge.user.dto.UpdateProfileRequest;
import com.youthchallenge.user.dto.UserProfileDto;
import com.youthchallenge.user.model.User;
import com.youthchallenge.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final BadgeService badgeService;
    private final GoalRepository goalRepository;
    private final ChallengeParticipationRepository challengeRepo;
    private final FriendRequestRepository friendRepo;
    private final UserService userService;
    private final FriendService friendService;


    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserProfileDto>>> searchUsers(
            @AuthenticationPrincipal User currentUser,
            @RequestParam String query) {
        List<UserProfileDto> results = userService.searchUsers(query, currentUser);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileDto>> getMyProfile(@AuthenticationPrincipal User user) {
        UserProfileDto profile = userService.getUserProfileDto(user.getId(), goalRepository, challengeRepo, friendRepo);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @RequestBody UpdateProfileRequest request) {
        UserProfileDto updatedProfile = userService.updateProfile(currentUser, request, goalRepository, challengeRepo, friendRepo);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updatedProfile));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserProfileDto>> getUserProfile(@PathVariable Long id) {
        UserProfileDto profile = userService.getUserProfileDto(id, goalRepository, challengeRepo, friendRepo);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @GetMapping("/{id}/friendship-status")
    public ResponseEntity<ApiResponse<FriendshipStatusDto>> getFriendshipStatus(
            @AuthenticationPrincipal User user, @PathVariable Long id) {
        User target = userService.getUserById(id);
        FriendshipStatusDto status = friendService.getFriendshipStatus(user, target);
        return ResponseEntity.ok(ApiResponse.success(status));
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
}
