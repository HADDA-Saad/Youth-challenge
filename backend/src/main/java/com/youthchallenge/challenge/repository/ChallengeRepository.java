package com.youthchallenge.challenge.repository;

import com.youthchallenge.challenge.enums.ChallengeStatus;
import com.youthchallenge.challenge.model.Challenge;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, Long> {

    Page<Challenge> findByStatusInOrderByCreatedAtDesc(List<ChallengeStatus> statuses, Pageable pageable);

    Page<Challenge> findByStatusInAndCommunityIdOrderByCreatedAtDesc(List<ChallengeStatus> statuses, Long communityId, Pageable pageable);

    Page<Challenge> findByStatusInAndCommunityIsNullOrderByCreatedAtDesc(List<ChallengeStatus> statuses, Pageable pageable);

    List<Challenge> findByStatusAndStartDateLessThanEqual(ChallengeStatus status, LocalDate date);

    List<Challenge> findByStatusAndEndDateLessThan(ChallengeStatus status, LocalDate date);
}
