package com.youthchallenge.feed.dto;

import com.youthchallenge.feed.enums.FeedItemType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedItemDto {
    private Long id;
    private Long actorId;
    private String actorUsername;
    private FeedItemType type;
    private String targetTitle;
    private Integer xpEarned;
    private Instant createdAt;
}
