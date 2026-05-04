package com.youthchallenge.challenge.repository;

import com.youthchallenge.challenge.model.Challenge;
import com.youthchallenge.challenge.model.ChallengeParticipation;
import com.youthchallenge.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChallengeParticipationRepository extends JpaRepository<ChallengeParticipation, Long> {

    boolean existsByChallengeAndUser(Challenge challenge, User user);

    long countByChallenge(Challenge challenge);

    List<ChallengeParticipation> findByChallengeAndUser(Challenge challenge, User user);

    List<ChallengeParticipation> findByChallenge(Challenge challenge);

    long countByUser(User user);

    List<ChallengeParticipation> findByUserOrderByJoinedAtDesc(User user);
}
