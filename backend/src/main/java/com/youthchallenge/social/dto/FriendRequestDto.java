package com.youthchallenge.social.dto;

import com.youthchallenge.social.enums.FriendRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendRequestDto {

    private Long requestId;
    private Long senderId;
    private String senderUsername;
    private String senderAvatarUrl;
    private FriendRequestStatus status;
    private LocalDateTime createdAt;
}
