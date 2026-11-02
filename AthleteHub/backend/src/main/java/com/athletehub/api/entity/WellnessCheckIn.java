package com.athletehub.api.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "wellness_checkins")
public class WellnessCheckIn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "athlete_id", nullable = false)
    private Athlete athlete;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "sleep_quality")
    private Integer sleepQuality; // 1-10

    @Column(name = "soreness")
    private Integer soreness; // 1-10

    @Column(name = "stress")
    private Integer stress; // 1-10

    @Column(name = "rpe")
    private Integer rpe; // Rate of Perceived Exertion (1-10)

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public WellnessCheckIn() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Athlete getAthlete() { return athlete; }
    public void setAthlete(Athlete athlete) { this.athlete = athlete; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Integer getSleepQuality() { return sleepQuality; }
    public void setSleepQuality(Integer sleepQuality) { this.sleepQuality = sleepQuality; }

    public Integer getSoreness() { return soreness; }
    public void setSoreness(Integer soreness) { this.soreness = soreness; }

    public Integer getStress() { return stress; }
    public void setStress(Integer stress) { this.stress = stress; }

    public Integer getRpe() { return rpe; }
    public void setRpe(Integer rpe) { this.rpe = rpe; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
