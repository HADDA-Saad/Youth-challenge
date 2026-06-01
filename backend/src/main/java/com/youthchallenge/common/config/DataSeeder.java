package com.youthchallenge.common.config;

import com.youthchallenge.badge.enums.BadgeKey;
import com.youthchallenge.badge.service.BadgeService;
import com.youthchallenge.challenge.enums.ChallengeStatus;
import com.youthchallenge.challenge.enums.ChallengeType;
import com.youthchallenge.challenge.model.Challenge;
import com.youthchallenge.challenge.model.ChallengeParticipation;
import com.youthchallenge.challenge.repository.ChallengeParticipationRepository;
import com.youthchallenge.challenge.repository.ChallengeRepository;
import com.youthchallenge.goal.enums.GoalCategory;
import com.youthchallenge.goal.enums.GoalStatus;
import com.youthchallenge.goal.enums.GoalVisibility;
import com.youthchallenge.goal.model.Goal;
import com.youthchallenge.goal.repository.GoalRepository;
import com.youthchallenge.social.enums.FriendRequestStatus;
import com.youthchallenge.social.model.FriendRequest;
import com.youthchallenge.social.repository.FriendRequestRepository;
import com.youthchallenge.user.model.User;
import com.youthchallenge.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final GoalRepository goalRepository;
    private final ChallengeRepository challengeRepository;
    private final ChallengeParticipationRepository participationRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final BadgeService badgeService;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.existsByEmail("amine@example.com")) {
            log.info("Database already populated with dummy data. Skipping seeder.");
            return;
        }

        log.info("Seeding dummy data into database...");

        // 1. Create Users
        User amine = createUser("Amine", "amine@example.com", 8500, "Legend", null);
        User youssef = createUser("Youssef", "youssef@example.com", 4200, "Champion", null);
        User fatima = createUser("Fatima", "fatima@example.com", 2100, "Achiever", null);
        User salma = createUser("Salma", "salma@example.com", 900, "Explorer", null);
        User karim = createUser("Karim", "karim@example.com", 150, "Beginner", null);

        // 2. Add Friendships (Amine is friends with Youssef and Fatima)
        createFriendship(amine, youssef);
        createFriendship(amine, fatima);
        
        // Pending request from Salma to Amine
        FriendRequest pendingReq = FriendRequest.builder().sender(salma).receiver(amine).status(FriendRequestStatus.PENDING).build();
        friendRequestRepository.save(pendingReq);

        // 3. Create Goals
        createGoal(amine, "Read 10 Books", GoalCategory.STUDY, 10, 3, GoalStatus.ACTIVE);
        createGoal(amine, "Run a 5K", GoalCategory.FITNESS, 5, 5, GoalStatus.COMPLETED);
        createGoal(youssef, "Learn React", GoalCategory.STUDY, 100, 45, GoalStatus.ACTIVE);
        createGoal(fatima, "Paint a Landscape", GoalCategory.CREATIVITY, 1, 0, GoalStatus.ACTIVE);

        // 4. Create Challenges
        Challenge c1 = createChallenge("Summer Fitness Bootcamp", "Workout every day for a month", ChallengeType.FIXED_DURATION, ChallengeStatus.ACTIVE, amine);
        Challenge c2 = createChallenge("100 Days of Code", "Code for 100 days consistently", ChallengeType.MILESTONE, ChallengeStatus.OPEN, youssef);
        Challenge c3 = createChallenge("Marathon Runners", "Who can run the most miles?", ChallengeType.COMPETITIVE, ChallengeStatus.ACTIVE, fatima);

        // 5. Join Challenges
        joinChallenge(c1, amine);
        joinChallenge(c1, youssef);
        joinChallenge(c1, fatima);
        joinChallenge(c2, youssef);
        joinChallenge(c2, salma);

        // 6. Award some badges
        badgeService.awardBadge(amine, BadgeKey.FIRST_STEP);
        badgeService.awardBadge(amine, BadgeKey.ON_FIRE);
        badgeService.awardBadge(youssef, BadgeKey.FIRST_STEP);
        badgeService.awardBadge(fatima, BadgeKey.BOOKWORM);

        log.info("Dummy data seeding complete!");
    }

    private User createUser(String username, String email, int xp, String level, String avatarUrl) {
        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode("password123"))
                .xp(xp)
                .level(level)
                .avatarUrl(avatarUrl)
                .build();
        return userRepository.save(user);
    }

    private void createFriendship(User u1, User u2) {
        FriendRequest req = FriendRequest.builder()
                .sender(u1)
                .receiver(u2)
                .status(FriendRequestStatus.ACCEPTED)
                .build();
        friendRequestRepository.save(req);
    }

    private void createGoal(User user, String title, GoalCategory category, int target, int current, GoalStatus status) {
        Goal goal = Goal.builder()
                .user(user)
                .title(title)
                .category(category)
                .targetValue(target)
                .currentValue(current)
                .status(status)
                .visibility(GoalVisibility.PUBLIC)
                .deadline(LocalDate.now().plusDays(30))
                .build();
        goalRepository.save(goal);
    }

    private Challenge createChallenge(String title, String desc, ChallengeType type, ChallengeStatus status, User creator) {
        Challenge c = Challenge.builder()
                .title(title)
                .description(desc)
                .type(type)
                .status(status)
                .creator(creator)
                .startDate(LocalDate.now().minusDays(5))
                .endDate(LocalDate.now().plusDays(25))
                .build();
        return challengeRepository.save(c);
    }

    private void joinChallenge(Challenge challenge, User user) {
        ChallengeParticipation p = ChallengeParticipation.builder()
                .challenge(challenge)
                .user(user)
                .build();
        participationRepository.save(p);
    }
}
