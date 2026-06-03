package com.youthchallenge.leaderboard.service;

import com.youthchallenge.challenge.model.Challenge;
import com.youthchallenge.challenge.repository.ChallengeRepository;
import com.youthchallenge.challenge.repository.ChallengeSubmissionRepository;
import com.youthchallenge.common.exception.ApiException;
import com.youthchallenge.leaderboard.dto.LeaderboardEntryDto;
import com.youthchallenge.social.repository.FriendRequestRepository;
import com.youthchallenge.user.model.User;
import com.youthchallenge.user.repository.UserRepository;
import com.youthchallenge.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final UserRepository userRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final ChallengeRepository challengeRepository;
    private final ChallengeSubmissionRepository challengeSubmissionRepository;
    private final UserService userService;

    public List<LeaderboardEntryDto> getGlobalLeaderboard() {
        List<User> topUsers = userRepository.findTop50ByOrderByXpDesc();
        return toLeaderboardList(topUsers);
    }

    public List<LeaderboardEntryDto> getFriendsLeaderboard(User user) {
        List<Long> friendIds = friendRequestRepository.findAcceptedFriendIds(user.getId());
        friendIds.add(user.getId()); // Include self
        
        List<User> users = userRepository.findByIdInOrderByXpDesc(friendIds);
        
        return toLeaderboardList(users);
    }

    public List<LeaderboardEntryDto> getChallengeLeaderboard(Long challengeId) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> ApiException.notFound("Challenge not found"));
                
        List<Object[]> rankings = challengeSubmissionRepository.findRankingsByChallenge(challenge);
        
        List<Long> userIds = rankings.stream()
                .map(row -> (Long) row[0])
                .collect(Collectors.toList());
        
        java.util.Map<Long, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        List<LeaderboardEntryDto> entries = new ArrayList<>();
        int rank = 1;
        for (Object[] row : rankings) {
            Long userId = (Long) row[0];
            Number totalValue = (Number) row[1];
            
            User u = userMap.get(userId);
            if (u == null) continue;

            entries.add(LeaderboardEntryDto.builder()
                    .rank(rank++)
                    .userId(u.getId())
                    .username(u.getDisplayName())
                    .avatarUrl(u.getAvatarUrl())
                    .xp(totalValue != null ? totalValue.intValue() : 0) // reusing xp field for total value here
                    .level(u.getLevel())
                    .build());
        }
        return entries;
    }

    private List<LeaderboardEntryDto> toLeaderboardList(List<User> users) {
        List<LeaderboardEntryDto> list = new ArrayList<>();
        int rank = 1;
        for (User u : users) {
            list.add(LeaderboardEntryDto.builder()
                    .rank(rank++)
                    .userId(u.getId())
                    .username(u.getDisplayName())
                    .avatarUrl(u.getAvatarUrl())
                    .xp(u.getXp())
                    .level(u.getLevel())
                    .build());
        }
        return list;
    }
}
