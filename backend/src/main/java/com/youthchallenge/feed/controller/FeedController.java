package com.youthchallenge.feed.controller;

import com.youthchallenge.common.dto.ApiResponse;
import com.youthchallenge.common.dto.PagedResponse;
import com.youthchallenge.feed.dto.FeedItemDto;
import com.youthchallenge.feed.service.FeedService;
import com.youthchallenge.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/feed")
@RequiredArgsConstructor
public class FeedController {

    private final FeedService feedService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<FeedItemDto>>> getFeed(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        PagedResponse<FeedItemDto> feed = feedService.getFeedForUser(currentUser, pageable);
        
        return ResponseEntity.ok(ApiResponse.success(feed));
    }
}
