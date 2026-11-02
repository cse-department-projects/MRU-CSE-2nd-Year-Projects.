package com.athletehub.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recruitment_shortlist_athletes")
public class RecruitmentShortlistAthlete {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shortlist_id", nullable = false)
    private RecruitmentShortlist shortlist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "athlete_id", nullable = false)
    private Athlete athlete;

    @Column(name = "added_at")
    private LocalDateTime addedAt;

    @PrePersist
    protected void onCreate() {
        addedAt = LocalDateTime.now();
    }

    public RecruitmentShortlistAthlete() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public RecruitmentShortlist getShortlist() { return shortlist; }
    public void setShortlist(RecruitmentShortlist shortlist) { this.shortlist = shortlist; }

    public Athlete getAthlete() { return athlete; }
    public void setAthlete(Athlete athlete) { this.athlete = athlete; }

    public LocalDateTime getAddedAt() { return addedAt; }
    public void setAddedAt(LocalDateTime addedAt) { this.addedAt = addedAt; }
}
