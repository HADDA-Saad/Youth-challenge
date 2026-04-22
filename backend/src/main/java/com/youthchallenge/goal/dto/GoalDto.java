package com.youthchallenge.goal.dto;

import com.youthchallenge.goal.enums.GoalCategory;
import com.youthchallenge.goal.enums.GoalStatus;
import com.youthchallenge.goal.enums.GoalVisibility;
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
public class GoalDto {

    private Long id;
    private String title;
    private GoalCategory category;
    private Integer targetValue;
    private Integer currentValue;
    private LocalDate deadline;
    private GoalVisibility visibility;
    private GoalStatus status;
    private Integer streakCount;
    private LocalDateTime createdAt;
}
