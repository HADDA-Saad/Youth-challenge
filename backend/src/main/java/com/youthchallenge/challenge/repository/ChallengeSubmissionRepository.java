package com.youthchallenge.challenge.repository;

import com.youthchallenge.challenge.model.Challenge;
import com.youthchallenge.challenge.model.ChallengeSubmission;
import com.youthchallenge.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChallengeSubmissionRepository extends JpaRepository<ChallengeSubmission, Long> {

    List<ChallengeSubmission> findByChallengeAndUser(Challenge challenge, User user);

    @Query("SELECT s.user.id, SUM(s.value) as totalValue FROM ChallengeSubmission s " +
           "WHERE s.challenge = :challenge GROUP BY s.user.id ORDER BY totalValue DESC")
    List<Object[]> findRankingsByChallenge(@Param("challenge") Challenge challenge);
}
