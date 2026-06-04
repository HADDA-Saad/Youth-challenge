package com.youthchallenge.notification.service;

import com.youthchallenge.badge.enums.BadgeKey;
import com.youthchallenge.badge.event.BadgeEarnedEvent;
import com.youthchallenge.challenge.event.ChallengeCompletedEvent;
import com.youthchallenge.challenge.model.Challenge;
import com.youthchallenge.challenge.repository.ChallengeRepository;
import com.youthchallenge.notification.dto.NotificationDto;
import com.youthchallenge.social.event.FriendAddedEvent;
import com.youthchallenge.social.model.FriendRequest;
import com.youthchallenge.social.enums.FriendRequestStatus;
import com.youthchallenge.social.repository.FriendRequestRepository;
import com.youthchallenge.user.model.User;
import com.youthchallenge.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationService notificationService;
    private final UserService userService;
    private final ChallengeRepository challengeRepository;
    private final FriendRequestRepository friendRequestRepository;

    /**
     * BadgeEarnedEvent → "You earned the {badge.name} badge!"
     */
    @EventListener
    public void onBadgeEarned(BadgeEarnedEvent event) {
        String badgeName = getBadgeDisplayName(event.getBadgeKey());
        NotificationDto notification = NotificationDto.builder()
                .message("You earned the " + badgeName + " badge!")
                .type("BADGE_EARNED")
                .build();
        notificationService.sendToUser(event.getUserId(), notification);
    }

    /**
     * ChallengeCompletedEvent → rank-specific and general participant messages
     */
    @EventListener
    public void onChallengeCompleted(ChallengeCompletedEvent event) {
        Challenge challenge = challengeRepository.findById(event.getChallengeId()).orElse(null);
        if (challenge == null) return;

        String title = challenge.getTitle();

        if (event.getRank() == 1) {
            NotificationDto winnerNotification = NotificationDto.builder()
                    .message("You finished 1st in " + title + "! +300 XP")
                    .type("CHALLENGE_WON")
                    .build();
            notificationService.sendToUser(event.getUserId(), winnerNotification);
        }

        // General completion notification for all participants
        int xp = event.getRank() == 1 ? 500 : 200;
        NotificationDto participantNotification = NotificationDto.builder()
                .message(title + " has ended. You earned " + xp + " XP.")
                .type("CHALLENGE_COMPLETED")
                .build();
        notificationService.sendToUser(event.getUserId(), participantNotification);
    }

    /**
     * FriendAddedEvent → "{username} accepted your friend request."
     * The event is published for both sender and receiver after acceptance.
     * We find the most recently accepted friendship involving this user and notify the other party.
     */
    @EventListener
    public void onFriendAdded(FriendAddedEvent event) {
        User user = userService.getUserById(event.getUserId());

        // Find the most recently accepted friend request involving this user
        List<FriendRequest> accepted = friendRequestRepository.findByReceiverAndStatus(user, FriendRequestStatus.ACCEPTED);
        if (!accepted.isEmpty()) {
            // The receiver accepted, notify the sender
            FriendRequest latest = accepted.get(accepted.size() - 1);
            if (latest.getReceiver().getId().equals(event.getUserId())) {
                // This event is for the receiver — notify the sender
                NotificationDto notification = NotificationDto.builder()
                        .message(user.getDisplayName() + " accepted your friend request.")
                        .type("FRIEND_ACCEPTED")
                        .build();
                notificationService.sendToUser(latest.getSender().getId(), notification);
            }
        }
    }

    private String getBadgeDisplayName(String badgeKey) {
        try {
            BadgeKey key = BadgeKey.valueOf(badgeKey);
            return switch (key) {
                case FIRST_STEP -> "First Step";
                case ON_FIRE -> "On Fire";
                case BOOKWORM -> "Bookworm";
                case WINNER -> "Winner";
                case UNSTOPPABLE -> "Unstoppable";
                case SOCIAL_BUTTERFLY -> "Social Butterfly";
            };
        } catch (IllegalArgumentException e) {
            return badgeKey;
        }
    }
}
