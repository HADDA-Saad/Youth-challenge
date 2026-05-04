package com.youthchallenge.goal.service;

import com.youthchallenge.common.exception.ApiException;
import com.youthchallenge.goal.dto.*;
import com.youthchallenge.goal.enums.GoalStatus;
import com.youthchallenge.goal.enums.GoalVisibility;
import com.youthchallenge.goal.event.GoalCompletedEvent;
import com.youthchallenge.goal.mapper.GoalMapper;
import com.youthchallenge.goal.model.Goal;
import com.youthchallenge.goal.model.GoalCheckIn;
import com.youthchallenge.goal.repository.GoalCheckInRepository;
import com.youthchallenge.goal.repository.GoalRepository;
import com.youthchallenge.user.model.User;
import com.youthchallenge.user.service.XpService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final GoalCheckInRepository checkInRepository;
    private final GoalMapper goalMapper;
    private final XpService xpService;
    private final ApplicationEventPublisher eventPublisher;

    public List<GoalDto> getGoals(User user) {
        List<Goal> goals = goalRepository.findAllByUserOrderByCreatedAtDesc(user);
        return goalMapper.toDtoList(goals);
    }

    public GoalDto getGoal(User user, Long goalId) {
        Goal goal = findGoalByIdAndUser(goalId, user);
        return goalMapper.toDto(goal);
    }

    @Transactional
    public GoalDto createGoal(User user, CreateGoalRequest request) {
        Goal goal = goalMapper.toEntity(request);
        goal.setUser(user);

        if (request.getVisibility() == null) {
            goal.setVisibility(GoalVisibility.PUBLIC);
        }

        Goal saved = goalRepository.save(goal);
        return goalMapper.toDto(saved);
    }

    @Transactional
    public GoalDto updateGoal(User user, Long goalId, UpdateGoalRequest request) {
        Goal goal = findGoalByIdAndUser(goalId, user);

        if (request.getTitle() != null) {
            goal.setTitle(request.getTitle());
        }
        if (request.getCategory() != null) {
            goal.setCategory(request.getCategory());
        }
        if (request.getTargetValue() != null) {
            goal.setTargetValue(request.getTargetValue());
        }
        if (request.getDeadline() != null) {
            goal.setDeadline(request.getDeadline());
        }
        if (request.getVisibility() != null) {
            goal.setVisibility(request.getVisibility());
        }

        Goal saved = goalRepository.save(goal);
        return goalMapper.toDto(saved);
    }

    @Transactional
    public void deleteGoal(User user, Long goalId) {
        Goal goal = findGoalByIdAndUser(goalId, user);
        goalRepository.delete(goal);
    }

    @Transactional
    public GoalDto checkIn(User user, Long goalId, CheckInRequest request) {
        Goal goal = findGoalByIdAndUser(goalId, user);

        if (goal.getStatus() == GoalStatus.COMPLETED) {
            throw ApiException.badRequest("Cannot check in on a completed goal");
        }

        // Create check-in record
        GoalCheckIn checkIn = GoalCheckIn.builder()
                .goal(goal)
                .value(request.getValue())
                .note(request.getNote())
                .build();
        checkInRepository.save(checkIn);

        // Update current value
        goal.setCurrentValue(goal.getCurrentValue() + request.getValue());

        // Update streak
        updateStreak(goal, checkIn);

        // Award daily check-in XP
        xpService.addXp(user, 10);

        // Check if goal is now completed
        if (goal.getCurrentValue() >= goal.getTargetValue()) {
            goal.setStatus(GoalStatus.COMPLETED);
            goal.setCurrentValue(goal.getTargetValue()); // Cap at target

            // Award completion XP
            xpService.addXp(user, 100);

            // Publish event for badge engine
            eventPublisher.publishEvent(new GoalCompletedEvent(this, user.getId(), goal.getId()));
        }

        // Award streak bonus XP at 7-day streak
        if (goal.getStreakCount() == 7) {
            xpService.addXp(user, 50);
        }

        // Publish check-in event for badge engine
        eventPublisher.publishEvent(
                new com.youthchallenge.goal.event.CheckInEvent(this, user.getId(), goal.getId(), goal.getStreakCount())
        );

        Goal saved = goalRepository.save(goal);
        return goalMapper.toDto(saved);
    }

    private void updateStreak(Goal goal, GoalCheckIn currentCheckIn) {
        Optional<GoalCheckIn> lastCheckIn = checkInRepository.findTopByGoalOrderByCheckedInAtDesc(goal);

        if (lastCheckIn.isPresent()) {
            LocalDate lastDate = lastCheckIn.get().getCheckedInAt().toLocalDate();
            LocalDate today = currentCheckIn.getCheckedInAt().toLocalDate();
            long daysBetween = ChronoUnit.DAYS.between(lastDate, today);

            if (daysBetween == 1) {
                // Consecutive day — increment streak
                goal.setStreakCount(goal.getStreakCount() + 1);
            } else if (daysBetween > 1) {
                // Missed a day — reset streak
                goal.setStreakCount(1);
            }
            // daysBetween == 0 means same day, don't change streak
        } else {
            // First check-in ever
            goal.setStreakCount(1);
        }
    }

    private Goal findGoalByIdAndUser(Long goalId, User user) {
        return goalRepository.findByIdAndUser(goalId, user)
                .orElseThrow(() -> ApiException.notFound("Goal not found"));
    }
}
