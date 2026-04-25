package com.youthchallenge.goal.controller;

import com.youthchallenge.common.dto.ApiResponse;
import com.youthchallenge.goal.dto.*;
import com.youthchallenge.goal.service.GoalService;
import com.youthchallenge.user.model.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<GoalDto>>> getGoals(@AuthenticationPrincipal User user) {
        List<GoalDto> goals = goalService.getGoals(user);
        return ResponseEntity.ok(ApiResponse.success(goals));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GoalDto>> createGoal(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateGoalRequest request) {
        GoalDto goal = goalService.createGoal(user, request);
        return ResponseEntity.ok(ApiResponse.success("Goal created successfully", goal));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GoalDto>> getGoal(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        GoalDto goal = goalService.getGoal(user, id);
        return ResponseEntity.ok(ApiResponse.success(goal));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GoalDto>> updateGoal(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody UpdateGoalRequest request) {
        GoalDto goal = goalService.updateGoal(user, id, request);
        return ResponseEntity.ok(ApiResponse.success("Goal updated successfully", goal));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        goalService.deleteGoal(user, id);
        return ResponseEntity.ok(ApiResponse.success("Goal deleted successfully", null));
    }

    @PostMapping("/{id}/checkin")
    public ResponseEntity<ApiResponse<GoalDto>> checkIn(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody CheckInRequest request) {
        GoalDto goal = goalService.checkIn(user, id, request);
        return ResponseEntity.ok(ApiResponse.success("Check-in successful", goal));
    }
}
