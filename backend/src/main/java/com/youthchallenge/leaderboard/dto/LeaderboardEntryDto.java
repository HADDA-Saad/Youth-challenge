package com.youthchallenge.leaderboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardEntryDto {

    private Integer rank;
    private Long userId;
    private String username;
    private String avatarUrl;
    private Integer xp;
    private String level;
}
