package com.youthchallenge.challenge.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class ChallengeCompletedEvent extends ApplicationEvent {

    private final Long userId;
    private final Long challengeId;
    private final int rank;

    public ChallengeCompletedEvent(Object source, Long userId, Long challengeId, int rank) {
        super(source);
        this.userId = userId;
        this.challengeId = challengeId;
        this.rank = rank;
    }
}
