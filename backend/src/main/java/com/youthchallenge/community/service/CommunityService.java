package com.youthchallenge.community.service;

import com.youthchallenge.common.exception.ApiException;
import com.youthchallenge.community.dto.CommunityBadgeDto;
import com.youthchallenge.community.dto.CommunityDto;
import com.youthchallenge.community.dto.CreateCommunityBadgeRequest;
import com.youthchallenge.community.dto.CreateCommunityRequest;
import com.youthchallenge.community.model.Community;
import com.youthchallenge.community.model.CommunityBadge;
import com.youthchallenge.community.model.CommunityMember;
import com.youthchallenge.community.repository.CommunityBadgeRepository;
import com.youthchallenge.community.repository.CommunityMemberRepository;
import com.youthchallenge.community.repository.CommunityRepository;
import com.youthchallenge.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityRepository communityRepository;
    private final CommunityMemberRepository memberRepository;
    private final CommunityBadgeRepository badgeRepository;

    public List<CommunityDto> getAllCommunities(User currentUser) {
        return communityRepository.findAll().stream()
                .map(c -> toDto(c, currentUser))
                .collect(Collectors.toList());
    }

    public CommunityDto getCommunity(User currentUser, Long id) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Community not found"));
        return toDto(community, currentUser);
    }

    @Transactional
    public CommunityDto createCommunity(User user, CreateCommunityRequest request) {
        Community community = Community.builder()
                .name(request.getName())
                .description(request.getDescription())
                .creator(user)
                .build();
        Community saved = communityRepository.save(community);

        // Creator automatically joins
        joinCommunity(user, saved.getId());

        return toDto(saved, user);
    }

    @Transactional
    public CommunityDto joinCommunity(User user, Long id) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Community not found"));

        if (memberRepository.existsByCommunityAndUser(community, user)) {
            throw ApiException.badRequest("Already a member of this community");
        }

        CommunityMember member = CommunityMember.builder()
                .community(community)
                .user(user)
                .xp(0)
                .level(1)
                .build();
        memberRepository.save(member);

        return toDto(community, user);
    }

    @Transactional
    public CommunityDto leaveCommunity(User user, Long id) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Community not found"));

        CommunityMember member = memberRepository.findByCommunityAndUser(community, user)
                .orElseThrow(() -> ApiException.badRequest("You are not a member of this community"));

        memberRepository.delete(member);
        return toDto(community, user);
    }

    @Transactional
    public CommunityBadgeDto addBadge(User user, Long communityId, CreateCommunityBadgeRequest request) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> ApiException.notFound("Community not found"));

        if (!community.getCreator().getId().equals(user.getId())) {
            throw ApiException.forbidden("Only the creator can add badges");
        }

        CommunityBadge badge = CommunityBadge.builder()
                .community(community)
                .name(request.getName())
                .description(request.getDescription())
                .requiredLevel(request.getRequiredLevel())
                .imageBase64(request.getImageBase64())
                .build();

        CommunityBadge saved = badgeRepository.save(badge);
        return toBadgeDto(saved);
    }

    public List<CommunityBadgeDto> getCommunityBadges(Long communityId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> ApiException.notFound("Community not found"));
        return badgeRepository.findByCommunity(community).stream()
                .map(this::toBadgeDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void addCommunityXp(User user, Community community, int amount) {
        memberRepository.findByCommunityAndUser(community, user).ifPresent(member -> {
            member.setXp(member.getXp() + amount);
            member.setLevel(calculateLevel(member.getXp()));
            memberRepository.save(member);
        });
    }

    private int calculateLevel(int xp) {
        if (xp >= 5000) return 5;
        if (xp >= 2000) return 4;
        if (xp >= 1000) return 3;
        if (xp >= 500) return 2;
        return 1;
    }

    private CommunityDto toDto(Community community, User currentUser) {
        int count = memberRepository.findByCommunity(community).size();
        Optional<CommunityMember> optMember = currentUser != null ?
                memberRepository.findByCommunityAndUser(community, currentUser) : Optional.empty();

        return CommunityDto.builder()
                .id(community.getId())
                .name(community.getName())
                .description(community.getDescription())
                .creatorId(community.getCreator().getId())
                .creatorUsername(community.getCreator().getDisplayName())
                .memberCount(count)
                .joined(optMember.isPresent())
                .userXp(optMember.map(CommunityMember::getXp).orElse(0))
                .userLevel(optMember.map(CommunityMember::getLevel).orElse(0))
                .createdAt(community.getCreatedAt())
                .build();
    }

    private CommunityBadgeDto toBadgeDto(CommunityBadge badge) {
        return CommunityBadgeDto.builder()
                .id(badge.getId())
                .communityId(badge.getCommunity().getId())
                .name(badge.getName())
                .description(badge.getDescription())
                .requiredLevel(badge.getRequiredLevel())
                .imageBase64(badge.getImageBase64())
                .build();
    }
}
