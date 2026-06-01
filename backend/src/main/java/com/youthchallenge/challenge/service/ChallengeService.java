package com.youthchallenge.challenge.service;

import com.youthchallenge.challenge.dto.*;
import com.youthchallenge.challenge.enums.ChallengeStatus;
import com.youthchallenge.challenge.event.ChallengeCompletedEvent;
import com.youthchallenge.challenge.model.Challenge;
import com.youthchallenge.challenge.model.ChallengeParticipation;
import com.youthchallenge.challenge.model.ChallengeSubmission;
import com.youthchallenge.challenge.repository.ChallengeParticipationRepository;
import com.youthchallenge.challenge.repository.ChallengeRepository;
import com.youthchallenge.challenge.repository.ChallengeSubmissionRepository;
import com.youthchallenge.common.exception.ApiException;
import com.youthchallenge.community.model.Community;
import com.youthchallenge.community.repository.CommunityRepository;
import com.youthchallenge.user.model.User;
import com.youthchallenge.user.service.XpService;
import com.youthchallenge.community.service.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final ChallengeParticipationRepository participationRepository;
    private final ChallengeSubmissionRepository submissionRepository;
    private final CommunityRepository communityRepository;
    private final CommunityService communityService;
    private final XpService xpService;
    private final ApplicationEventPublisher eventPublisher;

    public Page<ChallengeDto> getChallenges(User currentUser, Pageable pageable, Long communityId) {
        List<ChallengeStatus> statuses = List.of(ChallengeStatus.OPEN, ChallengeStatus.ACTIVE);
        Page<Challenge> challenges;
        if (communityId != null) {
            challenges = challengeRepository.findByStatusInAndCommunityIdOrderByCreatedAtDesc(statuses, communityId, pageable);
        } else {
            challenges = challengeRepository.findByStatusInOrderByCreatedAtDesc(statuses, pageable);
        }

        return challenges.map(challenge -> toDto(challenge, currentUser));
    }

    public ChallengeDto getChallenge(User currentUser, Long challengeId) {
        Challenge challenge = findChallengeById(challengeId);
        return toDto(challenge, currentUser);
    }

    @Transactional
    public ChallengeDto createChallenge(User user, CreateChallengeRequest request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw ApiException.badRequest("End date must be after start date");
        }

        Community community = null;
        if (request.getCommunityId() != null) {
            community = communityRepository.findById(request.getCommunityId())
                    .orElseThrow(() -> ApiException.notFound("Community not found"));
            if (!community.getCreator().getId().equals(user.getId())) {
                throw ApiException.forbidden("Only the community creator can create challenges in this community");
            }
        }

        Challenge challenge = Challenge.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .status(ChallengeStatus.OPEN)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .creator(user)
                .community(community)
                .build();

        Challenge saved = challengeRepository.save(challenge);
        return toDto(saved, user);
    }

    @Transactional
    public void deleteChallenge(User user, Long challengeId) {
        Challenge challenge = findChallengeById(challengeId);
        if (!challenge.getCreator().getId().equals(user.getId())) {
            throw ApiException.forbidden("Only the creator can delete this challenge");
        }
        challengeRepository.delete(challenge);
    }

    @Transactional
    public ChallengeDto joinChallenge(User user, Long challengeId) {
        Challenge challenge = findChallengeById(challengeId);

        if (challenge.getStatus() != ChallengeStatus.OPEN) {
            throw ApiException.badRequest("Can only join challenges with OPEN status");
        }

        if (participationRepository.existsByChallengeAndUser(challenge, user)) {
            throw ApiException.badRequest("You have already joined this challenge");
        }

        ChallengeParticipation participation = ChallengeParticipation.builder()
                .challenge(challenge)
                .user(user)
                .rank(0)
                .build();

        participationRepository.save(participation);

        return toDto(challenge, user);
    }
    @Transactional
    public void leaveChallenge(User user, Long challengeId) {
        Challenge challenge = findChallengeById(challengeId);

        if (challenge.getStatus() != ChallengeStatus.OPEN && challenge.getStatus() != ChallengeStatus.ACTIVE) {
            throw ApiException.badRequest("Cannot leave a completed or archived challenge");
        }

        List<ChallengeParticipation> participations = participationRepository.findByChallengeAndUser(challenge, user);
        if (participations.isEmpty()) {
            throw ApiException.badRequest("You have not joined this challenge");
        }

        participationRepository.deleteAll(participations);
    }
    @Transactional
    public ChallengeDto submitToChallenge(User user, Long challengeId, SubmissionRequest request) {
        Challenge challenge = findChallengeById(challengeId);

        if (challenge.getStatus() != ChallengeStatus.ACTIVE) {
            throw ApiException.badRequest("Can only submit to ACTIVE challenges");
        }

        if (!participationRepository.existsByChallengeAndUser(challenge, user)) {
            throw ApiException.forbidden("You must join this challenge before submitting");
        }

        ChallengeSubmission submission = ChallengeSubmission.builder()
                .challenge(challenge)
                .user(user)
                .value(request.getValue())
                .note(request.getNote())
                .proofText(request.getProofText())
                .build();

        submissionRepository.save(submission);

        return toDto(challenge, user);
    }

    @Transactional
    public void completeChallenge(Challenge challenge) {
        challenge.setStatus(ChallengeStatus.COMPLETED);
        challengeRepository.save(challenge);

        // Calculate rankings for competitive challenges
        List<Object[]> rankings = submissionRepository.findRankingsByChallenge(challenge);
        List<ChallengeParticipation> participations = participationRepository.findByChallenge(challenge);

        // Update ranks
        for (int i = 0; i < rankings.size(); i++) {
            Long userId = (Long) rankings.get(i)[0];
            for (ChallengeParticipation p : participations) {
                if (p.getUser().getId().equals(userId)) {
                    p.setRank(i + 1);
                    participationRepository.save(p);
                    break;
                }
            }
        }

        // Award XP to all participants
        for (ChallengeParticipation p : participations) {
            User participant = p.getUser();
            int xpEarned = 200;
            xpService.addXp(participant, xpEarned); // Base challenge completion XP

            int rank = p.getRank();
            if (rank == 1) {
                int bonus = 300;
                xpService.addXp(participant, bonus); // First place bonus
                xpEarned += bonus;
            }

            if (challenge.getCommunity() != null) {
                communityService.addCommunityXp(participant, challenge.getCommunity(), xpEarned);
            }

            // Publish event for badge engine
            eventPublisher.publishEvent(
                    new ChallengeCompletedEvent(this, participant.getId(), challenge.getId(), rank)
            );
        }
    }

    private Challenge findChallengeById(Long id) {
        return challengeRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Challenge not found"));
    }

    private ChallengeDto toDto(Challenge challenge, User currentUser) {
        long participantCount = participationRepository.countByChallenge(challenge);
        boolean joined = currentUser != null &&
                participationRepository.existsByChallengeAndUser(challenge, currentUser);

        return ChallengeDto.builder()
                .id(challenge.getId())
                .title(challenge.getTitle())
                .description(challenge.getDescription())
                .type(challenge.getType())
                .status(challenge.getStatus())
                .startDate(challenge.getStartDate())
                .endDate(challenge.getEndDate())
                .creatorId(challenge.getCreator().getId())
                .creatorUsername(challenge.getCreator().getDisplayName())
                .communityId(challenge.getCommunity() != null ? challenge.getCommunity().getId() : null)
                .communityName(challenge.getCommunity() != null ? challenge.getCommunity().getName() : null)
                .participantCount(participantCount)
                .joined(joined)
                .createdAt(challenge.getCreatedAt())
                .build();
    }
}
