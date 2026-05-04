package com.youthchallenge.challenge.dto;

import com.youthchallenge.challenge.enums.ChallengeStatus;
import com.youthchallenge.challenge.enums.ChallengeType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeDto {

    private Long id;
    private String title;
    private String description;
    private ChallengeType type;
    private ChallengeStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long creatorId;
    private String creatorUsername;
    private Long communityId;
    private String communityName;
    private long participantCount;
    private boolean joined;
    private LocalDateTime createdAt;
}
