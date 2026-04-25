package com.youthchallenge.goal.model;

import com.youthchallenge.goal.enums.GoalCategory;
import com.youthchallenge.goal.enums.GoalStatus;
import com.youthchallenge.goal.enums.GoalVisibility;
import com.youthchallenge.user.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "goals")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"user", "checkIns"})
@ToString(exclude = {"user", "checkIns"})
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GoalCategory category;

    @Column(nullable = false)
    private Integer targetValue;

    @Builder.Default
    @Column(nullable = false)
    private Integer currentValue = 0;

    private LocalDate deadline;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private GoalVisibility visibility = GoalVisibility.PUBLIC;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private GoalStatus status = GoalStatus.ACTIVE;

    @Builder.Default
    @Column(nullable = false)
    private Integer streakCount = 0;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Builder.Default
    @OneToMany(mappedBy = "goal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GoalCheckIn> checkIns = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
