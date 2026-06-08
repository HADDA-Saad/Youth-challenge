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

import java.util.ArrayList;
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

    public List<CommunityDto> searchCommunities(String query, User currentUser) {
        return communityRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query).stream()
                .map(c -> toDto(c, currentUser))
                .collect(Collectors.toList());
    }

    public CommunityDto getCommunity(User currentUser, Long id) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Community not found"));
        return toDto(community, currentUser);
    }

    public List<com.youthchallenge.community.dto.CommunityMemberDto> getCommunityMembers(Long id) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Community not found"));
        return memberRepository.findByCommunity(community).stream()
                .map(m -> com.youthchallenge.community.dto.CommunityMemberDto.builder()
                        .userId(m.getUser().getId())
                        .username(m.getUser().getDisplayName())
                        .email(m.getUser().getEmail())
                        .role(m.getRole() != null ? m.getRole().name() : "MEMBER")
                        .xp(m.getXp())
                        .level(m.getLevel())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public CommunityDto createCommunity(User user, CreateCommunityRequest request) {
        Community community = Community.builder()
                .name(request.getName())
                .description(request.getDescription())
                .creator(user)
                .build();
        Community saved = communityRepository.save(community);

        // Creator automatically joins as CREATOR
        CommunityMember member = CommunityMember.builder()
                .community(saved)
                .user(user)
                .xp(0)
                .level(1)
                .role(com.youthchallenge.community.enums.CommunityRole.CREATOR)
                .build();
        memberRepository.save(member);

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
                .requiredXp(request.getRequiredXp())
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

    public List<CommunityBadgeDto> getMyCommunityBadges(User user) {
        List<CommunityMember> memberships = memberRepository.findByUser(user);
        List<CommunityBadgeDto> earnedBadges = new ArrayList<>();
        
        for (CommunityMember member : memberships) {
            List<CommunityBadge> badges = badgeRepository.findByCommunity(member.getCommunity());
            for (CommunityBadge badge : badges) {
                if (badge.getRequiredLevel() <= member.getLevel()) {
                    earnedBadges.add(toBadgeDto(badge));
                }
            }
        }
        return earnedBadges;
    }

    @Transactional
    public void deleteBadge(User user, Long communityId, Long badgeId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> ApiException.notFound("Community not found"));

        if (!community.getCreator().getId().equals(user.getId())) {
            throw ApiException.forbidden("Only the creator can delete badges");
        }

        CommunityBadge badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> ApiException.notFound("Badge not found"));

        if (!badge.getCommunity().getId().equals(community.getId())) {
            throw ApiException.badRequest("Badge does not belong to this community");
        }

        community.getBadges().remove(badge);
        badgeRepository.delete(badge);
    }

    @Transactional
    public CommunityDto updateCommunity(User user, Long id, com.youthchallenge.community.dto.UpdateCommunityRequest request) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Community not found"));

        if (!community.getCreator().getId().equals(user.getId())) {
            throw ApiException.forbidden("Only the creator can edit this community");
        }

        community.setName(request.getName());
        community.setProfilePictureBase64(request.getProfilePictureBase64());
        communityRepository.save(community);

        return toDto(community, user);
    }

    @Transactional
    public void deleteCommunity(User user, Long id) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Community not found"));

        if (!community.getCreator().getId().equals(user.getId())) {
            throw ApiException.forbidden("Only the creator can delete this community");
        }

        communityRepository.delete(community);
    }

    @Transactional
    public void assignRole(User user, Long id, com.youthchallenge.community.dto.AssignRoleRequest request) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Community not found"));

        if (!community.getCreator().getId().equals(user.getId())) {
            throw ApiException.forbidden("Only the creator can assign roles");
        }

        CommunityMember targetMember = memberRepository.findByCommunityAndUserId(community, request.getUserId())
                .orElseThrow(() -> ApiException.notFound("Target user is not a member of this community"));

        targetMember.setRole(request.getRole());
        memberRepository.save(targetMember);
    }

    @Transactional
    public void addCommunityXp(User user, Community community, int amount) {
        memberRepository.findByCommunityAndUser(community, user).ifPresent(member -> {
            int oldLevel = member.getLevel();
            int newXp = member.getXp() + amount;
            int requiredXp = getRequiredXpForNextLevel(oldLevel);

            if (newXp >= requiredXp) {
                member.setLevel(oldLevel + 1);
                member.setXp(newXp - requiredXp);
            } else {
                member.setXp(newXp);
            }
            memberRepository.save(member);
        });
    }

    private int getRequiredXpForNextLevel(int level) {
        if (level == 1) return 500;
        if (level == 2) return 1000;
        if (level == 3) return 2000;
        return 5000;
    }

    public CommunityMember getMember(Community community, User user) {
        return memberRepository.findByCommunityAndUser(community, user).orElse(null);
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
                .creatorId(community.getCreator().getId())
                .creatorUsername(community.getCreator().getDisplayName())
                .profilePictureBase64(community.getProfilePictureBase64())
                .memberCount(count)
                .joined(optMember.isPresent())
                .userRole(optMember.map(m -> m.getRole() != null ? m.getRole().name() : "MEMBER").orElse(null))
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
                .requiredXp(badge.getRequiredXp())
                .imageBase64(badge.getImageBase64())
                .build();
    }
}
