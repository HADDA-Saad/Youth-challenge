package com.youthchallenge.leaderboard.controller;

import com.youthchallenge.common.dto.ApiResponse;
import com.youthchallenge.leaderboard.dto.LeaderboardEntryDto;
import com.youthchallenge.leaderboard.service.LeaderboardService;
import com.youthchallenge.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping("/global")
    public ResponseEntity<ApiResponse<List<LeaderboardEntryDto>>> getGlobalLeaderboard() {
        return ResponseEntity.ok(ApiResponse.success(leaderboardService.getGlobalLeaderboard()));
    }

    @GetMapping("/friends")
    public ResponseEntity<ApiResponse<List<LeaderboardEntryDto>>> getFriendsLeaderboard(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(leaderboardService.getFriendsLeaderboard(user)));
    }

    @GetMapping("/challenge/{challengeId}")
    public ResponseEntity<ApiResponse<List<LeaderboardEntryDto>>> getChallengeLeaderboard(@PathVariable Long challengeId) {
        return ResponseEntity.ok(ApiResponse.success(leaderboardService.getChallengeLeaderboard(challengeId)));
    }
}
