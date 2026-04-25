package com.youthchallenge.goal.repository;

import com.youthchallenge.goal.model.Goal;
import com.youthchallenge.goal.model.GoalCheckIn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GoalCheckInRepository extends JpaRepository<GoalCheckIn, Long> {

    Optional<GoalCheckIn> findTopByGoalOrderByCheckedInAtDesc(Goal goal);
}
