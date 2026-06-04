package com.youthchallenge.notification.service;

import com.youthchallenge.goal.enums.GoalStatus;
import com.youthchallenge.goal.repository.GoalRepository;
import com.youthchallenge.notification.dto.NotificationDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CheckInReminderScheduler {

    private final GoalRepository goalRepository;
    private final NotificationService notificationService;

    /**
     * Runs daily at 08:00. Fetches all users who have at least one ACTIVE goal
     * and pushes a check-in reminder notification to each.
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void sendDailyCheckInReminders() {
        List<Long> userIds = goalRepository.findDistinctUserIdsWithActiveGoals();
        log.info("Sending daily check-in reminders to {} users", userIds.size());

        NotificationDto reminder = NotificationDto.builder()
                .message("Don't forget to check in on your goals today!")
                .type("CHECK_IN_REMINDER")
                .build();

        for (Long userId : userIds) {
            notificationService.sendToUser(userId, reminder);
        }
    }
}
