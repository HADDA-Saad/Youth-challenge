package com.youthchallenge.community.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateCommunityRequest {
    @NotBlank(message = "Name is required")
    private String name;

    private String profilePictureBase64;
}
