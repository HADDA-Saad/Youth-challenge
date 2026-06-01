package com.youthchallenge.badge.repository;

import com.youthchallenge.badge.enums.BadgeKey;
import com.youthchallenge.badge.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {

    Optional<Badge> findByBadgeKey(BadgeKey badgeKey);
}
