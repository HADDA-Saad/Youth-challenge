package com.youthchallenge.community.repository;

import com.youthchallenge.community.model.Community;
import com.youthchallenge.community.model.CommunityBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityBadgeRepository extends JpaRepository<CommunityBadge, Long> {
    List<CommunityBadge> findByCommunity(Community community);
    List<CommunityBadge> findByCommunityAndRequiredLevelLessThanEqual(Community community, int level);
}
