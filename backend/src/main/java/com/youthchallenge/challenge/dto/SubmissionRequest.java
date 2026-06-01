package com.youthchallenge.challenge.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionRequest {

    @NotNull(message = "Value is required")
    @Min(value = 1, message = "Value must be at least 1")
    private Integer value;

    private String note;

    private String proofText;
}
