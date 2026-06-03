package com.youthchallenge.community.dto;

import com.youthchallenge.community.enums.CommunityRole;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignRoleRequest {
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Role is required")
    private CommunityRole role;
}
