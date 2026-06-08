package com.youthchallenge.user.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String username;
    private String email;
    private String avatarUrl;
    private String bio;
}
