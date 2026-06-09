package com.youthchallenge.badge.service;

import com.youthchallenge.badge.enums.BadgeKey;
import com.youthchallenge.challenge.event.ChallengeCompletedEvent;
import com.youthchallenge.challenge.repository.ChallengeParticipationRepository;
import com.youthchallenge.goal.enums.GoalCategory;
import com.youthchallenge.goal.enums.GoalStatus;
import com.youthchallenge.goal.event.CheckInEvent;
import com.youthchallenge.goal.event.GoalCompletedEvent;
import com.youthchallenge.goal.repository.GoalRepository;
import com.youthchallenge.social.event.FriendAddedEvent;
import com.youthchallenge.social.repository.FriendRequestRepository;
import com.youthchallenge.user.model.User;
import com.youthchallenge.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class BadgeEvaluator {

    private final BadgeService badgeService;
    private final UserService userService;
    private final GoalRepository goalRepository;
    private final ChallengeParticipationRepository participationRepository;
    private final FriendRequestRepository friendRequestRepository;

    /**
     * FIRST_STEP: First goal completed
     * BOOKWORM: 3 goals in STUDY category completed
     */
    @EventListener
    public void onGoalCompleted(GoalCompletedEvent event) {
        User user = userService.getUserById(event.getUserId());

        // FIRST_STEP — first goal ever completed
        badgeService.awardBadge(user, BadgeKey.FIRST_STEP);

        // BOOKWORM — 3 STUDY goals completed
        long studyCount = goalRepository.countByUserAndStatusAndCategory(
                user, GoalStatus.COMPLETED, GoalCategory.STUDY);
        if (studyCount >= 3) {
            badgeService.awardBadge(user, BadgeKey.BOOKWORM);
        }
    }

    /**
     * ON_FIRE: 7-day streak on any goal
     */
    @EventListener
    public void onCheckIn(CheckInEvent event) {
        if (event.getCurrentStreak() >= 7) {
            User user = userService.getUserById(event.getUserId());
            badgeService.awardBadge(user, BadgeKey.ON_FIRE);
        }
    }

    /**
     * WINNER: Rank 1 in a completed challenge
     * UNSTOPPABLE: 10 challenges completed
     */
    @EventListener
    public void onChallengeCompleted(ChallengeCompletedEvent event) {
        User user = userService.getUserById(event.getUserId());

        // WINNER — rank 1 in any completed challenge
        if (event.getRank() == 1) {
            badgeService.awardBadge(user, BadgeKey.WINNER);
        }

        // UNSTOPPABLE — 10 challenges completed
        long completedCount = participationRepository.countByUser(user);
        if (completedCount >= 10) {
            badgeService.awardBadge(user, BadgeKey.UNSTOPPABLE);
        }
    }

    /**
     * SOCIAL_BUTTERFLY: 10 accepted friends
     */
    @EventListener
    public void onFriendAdded(FriendAddedEvent event) {
        User user = userService.getUserById(event.getUserId());
        long friendsCount = friendRequestRepository.countAcceptedFriends(user);
        if (friendsCount >= 10) {
            badgeService.awardBadge(user, BadgeKey.SOCIAL_BUTTERFLY);
        }
    }
}
