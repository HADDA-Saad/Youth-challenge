package com.youthchallenge.goal.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "goal_check_ins")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "goal")
@ToString(exclude = "goal")
public class GoalCheckIn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_id", nullable = false)
    private Goal goal;

    @Column(nullable = false)
    private Integer value;

    private String note;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime checkedInAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (checkedInAt == null) {
            checkedInAt = LocalDateTime.now();
        }
    }
}
