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

    @GetMapping("/{id}/members")
    public ResponseEntity<ApiResponse<List<com.youthchallenge.community.dto.CommunityMemberDto>>> getCommunityMembers(
            @PathVariable Long id) {
        List<com.youthchallenge.community.dto.CommunityMemberDto> members = communityService.getCommunityMembers(id);
        return ResponseEntity.ok(ApiResponse.success(members));
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

    @DeleteMapping("/{communityId}/badges/{badgeId}")
    public ResponseEntity<ApiResponse<Void>> deleteCommunityBadge(
            @AuthenticationPrincipal User user,
            @PathVariable Long communityId,
            @PathVariable Long badgeId) {
        communityService.deleteBadge(user, communityId, badgeId);
        return ResponseEntity.ok(ApiResponse.success("Badge deleted successfully", null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CommunityDto>> updateCommunity(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody com.youthchallenge.community.dto.UpdateCommunityRequest request) {
        CommunityDto community = communityService.updateCommunity(user, id, request);
        return ResponseEntity.ok(ApiResponse.success("Community updated successfully", community));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCommunity(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        communityService.deleteCommunity(user, id);
        return ResponseEntity.ok(ApiResponse.success("Community deleted successfully", null));
    }

    @PostMapping("/{id}/roles")
    public ResponseEntity<ApiResponse<Void>> assignRole(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody com.youthchallenge.community.dto.AssignRoleRequest request) {
        communityService.assignRole(user, id, request);
        return ResponseEntity.ok(ApiResponse.success("Role assigned successfully", null));
    }

    @GetMapping("/my-badges")
    public ResponseEntity<ApiResponse<List<CommunityBadgeDto>>> getMyCommunityBadges(@AuthenticationPrincipal User user) {
        List<CommunityBadgeDto> badges = communityService.getMyCommunityBadges(user);
        return ResponseEntity.ok(ApiResponse.success(badges));
    }
}
