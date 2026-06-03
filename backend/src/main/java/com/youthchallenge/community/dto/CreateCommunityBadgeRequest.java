package com.youthchallenge.community.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateCommunityBadgeRequest {
    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotNull(message = "Required level is required")
    private Integer requiredLevel;

    @NotNull(message = "Required XP is required")
    private Integer requiredXp;

    @NotBlank(message = "Image Base64 is required")
    private String imageBase64;
}
