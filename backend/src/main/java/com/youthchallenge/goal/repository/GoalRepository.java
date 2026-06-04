package com.youthchallenge.goal.repository;

import com.youthchallenge.goal.model.Goal;
import com.youthchallenge.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {

    List<Goal> findAllByUserOrderByCreatedAtDesc(User user);

    Optional<Goal> findByIdAndUser(Long id, User user);

    long countByUserAndStatusAndCategory(User user,
                                          com.youthchallenge.goal.enums.GoalStatus status,
                                          com.youthchallenge.goal.enums.GoalCategory category);

    long countByUserAndStatus(User user, com.youthchallenge.goal.enums.GoalStatus status);

    @Query("SELECT DISTINCT g.user.id FROM Goal g WHERE g.status = com.youthchallenge.goal.enums.GoalStatus.ACTIVE")
    List<Long> findDistinctUserIdsWithActiveGoals();
}
