package com.youthchallenge.community.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CommunityBadgeDto {
    private Long id;
    private Long communityId;
    private String name;
    private String description;
    private int requiredLevel;
    private int requiredXp;
    private String imageBase64;
}
