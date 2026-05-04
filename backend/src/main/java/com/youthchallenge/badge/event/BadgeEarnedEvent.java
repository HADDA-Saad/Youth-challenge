package com.youthchallenge.badge.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class BadgeEarnedEvent extends ApplicationEvent {

    private final Long userId;
    private final String badgeKey;

    public BadgeEarnedEvent(Object source, Long userId, String badgeKey) {
        super(source);
        this.userId = userId;
        this.badgeKey = badgeKey;
    }
}
