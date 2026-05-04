package com.youthchallenge.goal.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class CheckInEvent extends ApplicationEvent {

    private final Long userId;
    private final Long goalId;
    private final int currentStreak;

    public CheckInEvent(Object source, Long userId, Long goalId, int currentStreak) {
        super(source);
        this.userId = userId;
        this.goalId = goalId;
        this.currentStreak = currentStreak;
    }
}
