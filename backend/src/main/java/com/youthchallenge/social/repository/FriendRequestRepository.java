package com.youthchallenge.social.repository;

import com.youthchallenge.social.enums.FriendRequestStatus;
import com.youthchallenge.social.model.FriendRequest;
import com.youthchallenge.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {

    Optional<FriendRequest> findBySenderAndReceiverAndStatus(User sender, User receiver, FriendRequestStatus status);

    List<FriendRequest> findByReceiverAndStatus(User receiver, FriendRequestStatus status);

    @Query("SELECT CASE WHEN fr.sender.id = :userId THEN fr.receiver.id ELSE fr.sender.id END " +
           "FROM FriendRequest fr " +
           "WHERE (fr.sender.id = :userId OR fr.receiver.id = :userId) " +
           "AND fr.status = 'ACCEPTED'")
    List<Long> findAcceptedFriendIds(@Param("userId") Long userId);

    @Query("SELECT COUNT(fr) FROM FriendRequest fr " +
           "WHERE (fr.sender = :user OR fr.receiver = :user) AND fr.status = 'ACCEPTED'")
    long countAcceptedFriends(@Param("user") User user);
    
    @Query("SELECT fr FROM FriendRequest fr " +
           "WHERE (fr.sender = :user1 AND fr.receiver = :user2) " +
           "OR (fr.sender = :user2 AND fr.receiver = :user1)")
    Optional<FriendRequest> findFriendshipBetween(@Param("user1") User user1, @Param("user2") User user2);
}
