package com.youthchallenge.challenge.service;

import com.youthchallenge.challenge.enums.ChallengeStatus;
import com.youthchallenge.challenge.model.Challenge;
import com.youthchallenge.challenge.repository.ChallengeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ChallengeScheduler {

    private final ChallengeRepository challengeRepository;
    private final ChallengeService challengeService;

    /**
     * Runs daily at midnight.
     * - Moves OPEN challenges past their startDate to ACTIVE
     * - Moves ACTIVE challenges past their endDate to COMPLETED and awards XP
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void updateChallengeStatuses() {
        LocalDate today = LocalDate.now();

        // OPEN → ACTIVE: challenges whose startDate has arrived
        List<Challenge> toActivate = challengeRepository
                .findByStatusAndStartDateLessThanEqual(ChallengeStatus.OPEN, today);

        for (Challenge challenge : toActivate) {
            challenge.setStatus(ChallengeStatus.ACTIVE);
            challengeRepository.save(challenge);
            log.info("Challenge [{}] '{}' moved to ACTIVE", challenge.getId(), challenge.getTitle());
        }

        // ACTIVE → COMPLETED: challenges whose endDate has passed
        List<Challenge> toComplete = challengeRepository
                .findByStatusAndEndDateLessThan(ChallengeStatus.ACTIVE, today);

        for (Challenge challenge : toComplete) {
            challengeService.completeChallenge(challenge);
            log.info("Challenge [{}] '{}' moved to COMPLETED", challenge.getId(), challenge.getTitle());
        }
    }
}
