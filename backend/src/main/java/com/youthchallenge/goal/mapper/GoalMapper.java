package com.youthchallenge.goal.mapper;

import com.youthchallenge.goal.dto.CreateGoalRequest;
import com.youthchallenge.goal.dto.GoalDto;
import com.youthchallenge.goal.model.Goal;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface GoalMapper {

    GoalDto toDto(Goal goal);

    List<GoalDto> toDtoList(List<Goal> goals);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "currentValue", constant = "0")
    @Mapping(target = "status", expression = "java(com.youthchallenge.goal.enums.GoalStatus.ACTIVE)")
    @Mapping(target = "streakCount", constant = "0")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "checkIns", ignore = true)
    Goal toEntity(CreateGoalRequest request);
}
