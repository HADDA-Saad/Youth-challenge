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

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final BadgeService badgeService;

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
}
