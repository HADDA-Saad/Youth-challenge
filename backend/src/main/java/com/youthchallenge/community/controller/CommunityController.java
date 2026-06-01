package com.youthchallenge.community.controller;

import com.youthchallenge.common.dto.ApiResponse;
import com.youthchallenge.community.dto.CommunityBadgeDto;
import com.youthchallenge.community.dto.CommunityDto;
import com.youthchallenge.community.dto.CreateCommunityBadgeRequest;
import com.youthchallenge.community.dto.CreateCommunityRequest;
import com.youthchallenge.community.service.CommunityService;
import com.youthchallenge.user.model.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/communities")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CommunityDto>>> getCommunities(@AuthenticationPrincipal User user) {
        List<CommunityDto> communities = communityService.getAllCommunities(user);
        return ResponseEntity.ok(ApiResponse.success(communities));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CommunityDto>> createCommunity(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateCommunityRequest request) {
        CommunityDto community = communityService.createCommunity(user, request);
        return ResponseEntity.ok(ApiResponse.success("Community created successfully", community));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CommunityDto>> getCommunity(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        CommunityDto community = communityService.getCommunity(user, id);
        return ResponseEntity.ok(ApiResponse.success(community));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<ApiResponse<CommunityDto>> joinCommunity(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        CommunityDto community = communityService.joinCommunity(user, id);
        return ResponseEntity.ok(ApiResponse.success("Joined community successfully", community));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<ApiResponse<CommunityDto>> leaveCommunity(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        CommunityDto community = communityService.leaveCommunity(user, id);
        return ResponseEntity.ok(ApiResponse.success("Left community successfully", community));
    }

    @PostMapping("/{id}/badges")
    public ResponseEntity<ApiResponse<CommunityBadgeDto>> addBadge(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody CreateCommunityBadgeRequest request) {
        CommunityBadgeDto badge = communityService.addBadge(user, id, request);
        return ResponseEntity.ok(ApiResponse.success("Badge added to community successfully", badge));
    }

    @GetMapping("/{id}/badges")
    public ResponseEntity<ApiResponse<List<CommunityBadgeDto>>> getCommunityBadges(@PathVariable Long id) {
        List<CommunityBadgeDto> badges = communityService.getCommunityBadges(id);
        return ResponseEntity.ok(ApiResponse.success(badges));
    }
}
