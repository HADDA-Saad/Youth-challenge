package com.youthchallenge.community.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class CommunityDto {
    private Long id;
    private String name;
    private String description;
    private Long creatorId;
    private String creatorUsername;
    private String profilePictureBase64;
    private int memberCount;
    private boolean joined;
    private String userRole;
    private int userXp;
    private int userLevel;
    private LocalDateTime createdAt;
}
