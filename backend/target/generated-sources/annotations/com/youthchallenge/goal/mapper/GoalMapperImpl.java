package com.youthchallenge.goal.mapper;

import com.youthchallenge.goal.dto.CreateGoalRequest;
import com.youthchallenge.goal.dto.GoalDto;
import com.youthchallenge.goal.model.Goal;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-21T14:27:00+0100",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class GoalMapperImpl implements GoalMapper {

    @Override
    public GoalDto toDto(Goal goal) {
        if ( goal == null ) {
            return null;
        }

        GoalDto.GoalDtoBuilder goalDto = GoalDto.builder();

        goalDto.category( goal.getCategory() );
        goalDto.createdAt( goal.getCreatedAt() );
        goalDto.currentValue( goal.getCurrentValue() );
        goalDto.deadline( goal.getDeadline() );
        goalDto.id( goal.getId() );
        goalDto.status( goal.getStatus() );
        goalDto.streakCount( goal.getStreakCount() );
        goalDto.targetValue( goal.getTargetValue() );
        goalDto.title( goal.getTitle() );
        goalDto.visibility( goal.getVisibility() );

        return goalDto.build();
    }

    @Override
    public List<GoalDto> toDtoList(List<Goal> goals) {
        if ( goals == null ) {
            return null;
        }

        List<GoalDto> list = new ArrayList<GoalDto>( goals.size() );
        for ( Goal goal : goals ) {
            list.add( toDto( goal ) );
        }

        return list;
    }

    @Override
    public Goal toEntity(CreateGoalRequest request) {
        if ( request == null ) {
            return null;
        }

        Goal.GoalBuilder goal = Goal.builder();

        goal.category( request.getCategory() );
        goal.deadline( request.getDeadline() );
        goal.targetValue( request.getTargetValue() );
        goal.title( request.getTitle() );
        goal.visibility( request.getVisibility() );

        goal.currentValue( 0 );
        goal.status( com.youthchallenge.goal.enums.GoalStatus.ACTIVE );
        goal.streakCount( 0 );

        return goal.build();
    }
}
