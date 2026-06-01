package com.youthchallenge.social.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class FriendAddedEvent extends ApplicationEvent {

    private final Long userId;

    public FriendAddedEvent(Object source, Long userId) {
        super(source);
        this.userId = userId;
    }
}
