package com.youthchallenge.user.service;

import com.youthchallenge.user.model.User;
import com.youthchallenge.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class XpService {

    private final UserRepository userRepository;

    @Transactional
    public void addXp(User user, int amount) {
        user.setXp(user.getXp() + amount);
        user.setLevel(calculateLevel(user.getXp()));
        userRepository.save(user);
    }

    private String calculateLevel(int xp) {
        if (xp >= 7000) return "Legend";
        if (xp >= 3500) return "Champion";
        if (xp >= 1500) return "Achiever";
        if (xp >= 500) return "Explorer";
        return "Beginner";
    }
}
