package com.youthchallenge.challenge.controller;

import com.youthchallenge.challenge.dto.*;
import com.youthchallenge.challenge.service.ChallengeService;
import com.youthchallenge.common.dto.ApiResponse;
import com.youthchallenge.common.dto.PagedResponse;
import com.youthchallenge.user.model.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/challenges")
@RequiredArgsConstructor
public class ChallengeController {

    private final ChallengeService challengeService;

    @GetMapping
    public ResponseEntity<PagedResponse<ChallengeDto>> getChallenges(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long communityId) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ChallengeDto> challenges = challengeService.getChallenges(user, pageable, communityId);

        return ResponseEntity.ok(PagedResponse.of(
                challenges.getContent(),
                challenges.getNumber(),
                challenges.getSize(),
                challenges.getTotalElements(),
                challenges.getTotalPages(),
                challenges.isLast()
        ));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<java.util.List<ChallengeDto>>> getMyChallenges(
            @AuthenticationPrincipal User user) {
        java.util.List<ChallengeDto> challenges = challengeService.getMyChallenges(user);
        return ResponseEntity.ok(ApiResponse.success(challenges));
    }

    @GetMapping("/global")
    public ResponseEntity<PagedResponse<ChallengeDto>> getGlobalChallenges(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ChallengeDto> challenges = challengeService.getGlobalChallenges(user, pageable);

        return ResponseEntity.ok(PagedResponse.of(
                challenges.getContent(),
                challenges.getNumber(),
                challenges.getSize(),
                challenges.getTotalElements(),
                challenges.getTotalPages(),
                challenges.isLast()
        ));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ChallengeDto>> createChallenge(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateChallengeRequest request) {
        ChallengeDto challenge = challengeService.createChallenge(user, request);
        return ResponseEntity.ok(ApiResponse.success("Challenge created successfully", challenge));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ChallengeDto>> getChallenge(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        ChallengeDto challenge = challengeService.getChallenge(user, id);
        return ResponseEntity.ok(ApiResponse.success(challenge));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ChallengeDto>> updateChallenge(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody UpdateChallengeRequest request) {
        ChallengeDto challenge = challengeService.updateChallenge(user, id, request);
        return ResponseEntity.ok(ApiResponse.success("Challenge updated successfully", challenge));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteChallenge(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        challengeService.deleteChallenge(user, id);
        return ResponseEntity.ok(ApiResponse.success("Challenge deleted successfully", null));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<ApiResponse<ChallengeDto>> joinChallenge(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        ChallengeDto challenge = challengeService.joinChallenge(user, id);
        return ResponseEntity.ok(ApiResponse.success("Joined challenge successfully", challenge));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<ApiResponse<Void>> leaveChallenge(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        challengeService.leaveChallenge(user, id);
        return ResponseEntity.ok(ApiResponse.success("Left challenge successfully", null));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<ChallengeDto>> submitToChallenge(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody SubmissionRequest request) {
        ChallengeDto challenge = challengeService.submitToChallenge(user, id, request);
        return ResponseEntity.ok(ApiResponse.success("Submission recorded successfully", challenge));
    }
}
