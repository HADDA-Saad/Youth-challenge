package com.youthchallenge.social.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendshipStatusDto {
    private String status; // "NONE", "ACCEPTED", "PENDING_SENT", "PENDING_RECEIVED", "SELF"
    private Long requestId; // Can be null if status is NONE or SELF
}
