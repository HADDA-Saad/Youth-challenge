package com.youthchallenge.community.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CommunityMemberDto {
    private Long userId;
    private String username;
    private String email;
    private String role;
    private int xp;
    private int level;
}
