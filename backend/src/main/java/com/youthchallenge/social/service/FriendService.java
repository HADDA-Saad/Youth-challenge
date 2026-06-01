package com.youthchallenge.social.service;

import com.youthchallenge.common.exception.ApiException;
import com.youthchallenge.social.dto.FriendDto;
import com.youthchallenge.social.dto.FriendRequestDto;
import com.youthchallenge.social.enums.FriendRequestStatus;
import com.youthchallenge.social.event.FriendAddedEvent;
import com.youthchallenge.social.model.FriendRequest;
import com.youthchallenge.social.repository.FriendRequestRepository;
import com.youthchallenge.user.model.User;
import com.youthchallenge.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendService {

    private final FriendRequestRepository friendRequestRepository;
    private final UserService userService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void sendFriendRequest(User sender, Long receiverId) {
        if (sender.getId().equals(receiverId)) {
            throw ApiException.badRequest("You cannot send a friend request to yourself.");
        }

        User receiver = userService.getUserById(receiverId);

        // Check if there's already a request between these two
        Optional<FriendRequest> existingOpt = friendRequestRepository.findFriendshipBetween(sender, receiver);
        if (existingOpt.isPresent()) {
            FriendRequest existing = existingOpt.get();
            if (existing.getStatus() == FriendRequestStatus.PENDING) {
                throw ApiException.badRequest("A pending friend request already exists.");
            } else if (existing.getStatus() == FriendRequestStatus.ACCEPTED) {
                throw ApiException.badRequest("You are already friends.");
            }
        }

        FriendRequest request = FriendRequest.builder()
                .sender(sender)
                .receiver(receiver)
                .status(FriendRequestStatus.PENDING)
                .build();

        friendRequestRepository.save(request);
    }

    @Transactional
    public void acceptFriendRequest(User receiver, Long requestId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> ApiException.notFound("Friend request not found."));

        if (!request.getReceiver().getId().equals(receiver.getId())) {
            throw ApiException.forbidden("You can only accept requests sent to you.");
        }

        if (request.getStatus() != FriendRequestStatus.PENDING) {
            throw ApiException.badRequest("Request is not pending.");
        }

        request.setStatus(FriendRequestStatus.ACCEPTED);
        friendRequestRepository.save(request);

        // Publish event for badge evaluation (SOCIAL_BUTTERFLY)
        eventPublisher.publishEvent(new FriendAddedEvent(this, request.getSender().getId()));
        eventPublisher.publishEvent(new FriendAddedEvent(this, request.getReceiver().getId()));
    }

    @Transactional
    public void declineOrRemoveFriend(User user, Long requestId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> ApiException.notFound("Friend request not found."));

        if (!request.getSender().getId().equals(user.getId()) && !request.getReceiver().getId().equals(user.getId())) {
            throw ApiException.forbidden("Not authorized to remove this request.");
        }

        friendRequestRepository.delete(request);
    }

    public List<FriendDto> getAcceptedFriends(User user) {
        List<Long> friendIds = friendRequestRepository.findAcceptedFriendIds(user.getId());
        
        return friendIds.stream()
                .map(userService::getUserById)
                .map(this::toFriendDto)
                .collect(Collectors.toList());
    }

    public List<FriendRequestDto> getPendingRequests(User receiver) {
        return friendRequestRepository.findByReceiverAndStatus(receiver, FriendRequestStatus.PENDING)
                .stream()
                .map(this::toRequestDto)
                .collect(Collectors.toList());
    }
    
    public String getFriendshipStatus(User user1, User user2) {
        if (user1.getId().equals(user2.getId())) {
            return "SELF";
        }
        Optional<FriendRequest> opt = friendRequestRepository.findFriendshipBetween(user1, user2);
        if (opt.isEmpty()) return "NONE";
        FriendRequest fr = opt.get();
        if (fr.getStatus() == FriendRequestStatus.ACCEPTED) return "ACCEPTED";
        if (fr.getStatus() == FriendRequestStatus.PENDING) {
             return fr.getSender().getId().equals(user1.getId()) ? "PENDING_SENT" : "PENDING_RECEIVED";
        }
        return "NONE";
    }

    private FriendDto toFriendDto(User user) {
        return FriendDto.builder()
                .userId(user.getId())
                .username(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .xp(user.getXp())
                .level(user.getLevel())
                .build();
    }

    private FriendRequestDto toRequestDto(FriendRequest request) {
        return FriendRequestDto.builder()
                .requestId(request.getId())
                .senderId(request.getSender().getId())
                .senderUsername(request.getSender().getDisplayName())
                .senderAvatarUrl(request.getSender().getAvatarUrl())
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .build();
    }
}
