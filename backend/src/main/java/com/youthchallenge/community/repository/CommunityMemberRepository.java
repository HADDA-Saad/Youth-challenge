package com.youthchallenge.community.repository;

import com.youthchallenge.community.model.Community;
import com.youthchallenge.community.model.CommunityMember;
import com.youthchallenge.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityMemberRepository extends JpaRepository<CommunityMember, Long> {
    boolean existsByCommunityAndUser(Community community, User user);
    Optional<CommunityMember> findByCommunityAndUser(Community community, User user);
    List<CommunityMember> findByUser(User user);
    List<CommunityMember> findByCommunity(Community community);
}
