package com.youthchallenge.notification.service;

import com.youthchallenge.notification.dto.NotificationDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Push a notification to a specific user via WebSocket.
     * Publishes to /topic/notifications/{userId}.
     */
    public void sendToUser(Long userId, NotificationDto payload) {
        if (payload.getCreatedAt() == null) {
            payload.setCreatedAt(Instant.now());
        }
        String destination = "/topic/notifications/" + userId;
        messagingTemplate.convertAndSend(destination, payload);
        log.debug("Notification sent to user {}: {}", userId, payload.getMessage());
    }
}
