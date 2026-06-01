package com.youthchallenge.social.controller;

import com.youthchallenge.common.dto.ApiResponse;
import com.youthchallenge.social.dto.FriendDto;
import com.youthchallenge.social.dto.FriendRequestDto;
import com.youthchallenge.social.service.FriendService;
import com.youthchallenge.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;

    @PostMapping("/request/{userId}")
    public ResponseEntity<ApiResponse<Void>> sendFriendRequest(
            @AuthenticationPrincipal User user,
            @PathVariable Long userId) {
        friendService.sendFriendRequest(user, userId);
        return ResponseEntity.ok(ApiResponse.success("Friend request sent", null));
    }

    @PutMapping("/accept/{requestId}")
    public ResponseEntity<ApiResponse<Void>> acceptFriendRequest(
            @AuthenticationPrincipal User user,
            @PathVariable Long requestId) {
        friendService.acceptFriendRequest(user, requestId);
        return ResponseEntity.ok(ApiResponse.success("Friend request accepted", null));
    }

    @DeleteMapping("/{requestId}")
    public ResponseEntity<ApiResponse<Void>> declineOrRemoveFriend(
            @AuthenticationPrincipal User user,
            @PathVariable Long requestId) {
        friendService.declineOrRemoveFriend(user, requestId);
        return ResponseEntity.ok(ApiResponse.success("Request removed", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FriendDto>>> getFriends(@AuthenticationPrincipal User user) {
        List<FriendDto> friends = friendService.getAcceptedFriends(user);
        return ResponseEntity.ok(ApiResponse.success(friends));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<FriendRequestDto>>> getPendingRequests(@AuthenticationPrincipal User user) {
        List<FriendRequestDto> requests = friendService.getPendingRequests(user);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }
}
