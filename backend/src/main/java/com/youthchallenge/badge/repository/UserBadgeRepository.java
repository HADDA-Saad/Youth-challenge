package com.youthchallenge.badge.repository;

import com.youthchallenge.badge.enums.BadgeKey;
import com.youthchallenge.badge.model.UserBadge;
import com.youthchallenge.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {

    boolean existsByUserAndBadge_BadgeKey(User user, BadgeKey badgeKey);

    List<UserBadge> findByUserOrderByEarnedAtDesc(User user);

    @Query("SELECT ub FROM UserBadge ub JOIN FETCH ub.badge WHERE ub.user.id = :userId ORDER BY ub.earnedAt DESC")
    List<UserBadge> findByUserIdWithBadge(@Param("userId") Long userId);
}
