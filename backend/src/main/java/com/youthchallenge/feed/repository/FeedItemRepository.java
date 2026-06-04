package com.youthchallenge.feed.repository;

import com.youthchallenge.feed.model.FeedItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedItemRepository extends JpaRepository<FeedItem, Long> {
    Page<FeedItem> findByActorIdInOrderByCreatedAtDesc(List<Long> actorIds, Pageable pageable);
}
