package com.youthchallenge.community.repository;

import com.youthchallenge.community.model.Community;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityRepository extends JpaRepository<Community, Long> {

    List<Community> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);
}
