package com.youthchallenge.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {

    private Long id;
    private String username;
    private String email;
    private Integer xp;
    private String level;
    private String avatarUrl;
    private LocalDateTime createdAt;
    
    private int goalsCompleted;
    private int challengesCompleted;
    private int friendsCount;
}
