package com.youthchallenge.social.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendDto {

    private Long userId;
    private String username;
    private String avatarUrl;
    private Integer xp;
    private String level;
}
