package com.youthchallenge.goal.dto;

import com.youthchallenge.goal.enums.GoalCategory;
import com.youthchallenge.goal.enums.GoalVisibility;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateGoalRequest {

    private String title;

    private GoalCategory category;

    @Min(value = 1, message = "Target value must be at least 1")
    private Integer targetValue;

    @Future(message = "Deadline must be in the future")
    private LocalDate deadline;

    private GoalVisibility visibility;
}
