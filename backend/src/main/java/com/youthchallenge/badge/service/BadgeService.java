package com.youthchallenge.badge.service;

import com.youthchallenge.badge.dto.BadgeDto;
import com.youthchallenge.badge.enums.BadgeKey;
import com.youthchallenge.badge.event.BadgeEarnedEvent;
import com.youthchallenge.badge.model.Badge;
import com.youthchallenge.badge.model.UserBadge;
import com.youthchallenge.badge.repository.BadgeRepository;
import com.youthchallenge.badge.repository.UserBadgeRepository;
import com.youthchallenge.user.model.User;
import com.youthchallenge.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final UserService userService;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Awards a badge to a user if they don't already have it.
     * Returns true if the badge was newly awarded.
     */
    @Transactional
    public boolean awardBadge(User user, BadgeKey badgeKey) {
        // Check if user already has this badge
        if (userBadgeRepository.existsByUserAndBadge_BadgeKey(user, badgeKey)) {
            return false;
        }

        // Find or create the badge definition
        Badge badge = badgeRepository.findByBadgeKey(badgeKey)
                .orElseGet(() -> createBadgeDefinition(badgeKey));

        UserBadge userBadge = UserBadge.builder()
                .user(user)
                .badge(badge)
                .build();

        userBadgeRepository.save(userBadge);

        log.info("Badge [{}] awarded to user [{}]", badgeKey, user.getDisplayName());

        // Publish event for future notification system
        eventPublisher.publishEvent(new BadgeEarnedEvent(this, user.getId(), badgeKey.name()));

        return true;
    }

    public List<BadgeDto> getUserBadges(Long userId) {
        List<UserBadge> userBadges = userBadgeRepository.findByUserIdWithBadge(userId);
        return userBadges.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private BadgeDto toDto(UserBadge userBadge) {
        Badge badge = userBadge.getBadge();
        return BadgeDto.builder()
                .id(badge.getId())
                .key(badge.getBadgeKey().name())
                .name(badge.getName())
                .description(badge.getDescription())
                .earnedAt(userBadge.getEarnedAt())
                .build();
    }

    private Badge createBadgeDefinition(BadgeKey key) {
        Badge badge = Badge.builder()
                .badgeKey(key)
                .name(getBadgeName(key))
                .description(getBadgeDescription(key))
                .build();
        return badgeRepository.save(badge);
    }

    private String getBadgeName(BadgeKey key) {
        return switch (key) {
            case FIRST_STEP -> "First Step";
            case ON_FIRE -> "On Fire";
            case BOOKWORM -> "Bookworm";
            case WINNER -> "Winner";
            case UNSTOPPABLE -> "Unstoppable";
            case SOCIAL_BUTTERFLY -> "Social Butterfly";
        };
    }

    private String getBadgeDescription(BadgeKey key) {
        return switch (key) {
            case FIRST_STEP -> "Complete your first goal";
            case ON_FIRE -> "Achieve a 7-day streak on any goal";
            case BOOKWORM -> "Complete 3 goals in the Study category";
            case WINNER -> "Finish 1st place in a completed challenge";
            case UNSTOPPABLE -> "Complete 10 challenges";
            case SOCIAL_BUTTERFLY -> "Have 10 accepted friends";
        };
    }
}
