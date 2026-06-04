package com.youthchallenge.feed.service;

import com.youthchallenge.common.dto.PagedResponse;
import com.youthchallenge.feed.dto.FeedItemDto;
import com.youthchallenge.feed.enums.FeedItemType;
import com.youthchallenge.feed.model.FeedItem;
import com.youthchallenge.feed.repository.FeedItemRepository;
import com.youthchallenge.social.repository.FriendRequestRepository;
import com.youthchallenge.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedService {

    private final FeedItemRepository feedItemRepository;
    private final FriendRequestRepository friendRequestRepository;

    @Transactional
    public void recordEvent(User actor, FeedItemType type, String targetTitle, Integer xpEarned) {
        FeedItem feedItem = FeedItem.builder()
                .actor(actor)
                .type(type)
                .targetTitle(targetTitle)
                .xpEarned(xpEarned)
                .build();
        feedItemRepository.save(feedItem);
    }

    @Transactional(readOnly = true)
    public PagedResponse<FeedItemDto> getFeedForUser(User viewer, Pageable pageable) {
        List<Long> acceptedFriendIds = friendRequestRepository.findAcceptedFriendIds(viewer.getId());
        
        Page<FeedItem> feedPage;
        if (acceptedFriendIds.isEmpty()) {
            feedPage = Page.empty(pageable);
        } else {
            feedPage = feedItemRepository.findByActorIdInOrderByCreatedAtDesc(acceptedFriendIds, pageable);
        }

        List<FeedItemDto> dtoList = feedPage.getContent().stream()
                .map(this::mapToDto)
                .toList();

        return PagedResponse.of(
                dtoList,
                feedPage.getNumber(),
                feedPage.getSize(),
                feedPage.getTotalElements(),
                feedPage.getTotalPages(),
                feedPage.isLast()
        );
    }

    private FeedItemDto mapToDto(FeedItem item) {
        return FeedItemDto.builder()
                .id(item.getId())
                .actorId(item.getActor().getId())
                .actorUsername(item.getActor().getDisplayName())
                .type(item.getType())
                .targetTitle(item.getTargetTitle())
                .xpEarned(item.getXpEarned())
                .createdAt(item.getCreatedAt())
                .build();
    }
}
