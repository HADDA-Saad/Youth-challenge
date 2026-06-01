package com.youthchallenge.community.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "community_badges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityBadge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", nullable = false)
    private Community community;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private int requiredLevel;

    @Column(columnDefinition = "LONGTEXT")
    private String imageBase64; // Small PNG stored as base64
}
