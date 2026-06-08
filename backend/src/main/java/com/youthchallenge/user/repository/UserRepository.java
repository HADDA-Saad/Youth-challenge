package com.youthchallenge.user.repository;

import com.youthchallenge.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    List<User> findTop50ByOrderByXpDesc();

    List<User> findByIdInOrderByXpDesc(List<Long> ids);

    List<User> findByUsernameContainingIgnoreCaseAndIdNot(String username, Long id);
}
