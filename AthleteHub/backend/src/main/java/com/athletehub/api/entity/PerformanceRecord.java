package com.athletehub.api.entity;

import com.athletehub.api.entity.enums.RecordContext;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "performance_records", indexes = {
    @Index(name = "idx_record_code", columnList = "record_code"),
    @Index(name = "idx_perf_athlete", columnList = "athlete_id"),
    @Index(name = "idx_perf_metric", columnList = "metric_name")
})
public class PerformanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "record_code", length = 20, unique = true, nullable = false)
    private String recordCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "athlete_id", nullable = false)
    private Athlete athlete;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sport_id")
    private Sport sport;

    @Column(name = "metric_name", nullable = false)
    private String metricName;

    @Column(name = "metric_value", nullable = false)
    private Double metricValue;

    @Column(name = "unit", length = 50)
    private String unit;

    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "context", length = 30, nullable = false)
    private RecordContext context = RecordContext.GENERAL;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_match_id")
    private Match relatedMatch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_training_session_id")
    private TrainingSession relatedTrainingSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_event_id")
    private Event relatedEvent;

    @Column(name = "higher_is_better")
    private Boolean higherIsBetter = true;

    @Column(name = "is_personal_best")
    private Boolean isPersonalBest = false;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by_id")
    private User verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private Integer createdBy;

    @Column(name = "updated_by")
    private Integer updatedBy;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public PerformanceRecord() {}

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getRecordCode() { return recordCode; }
    public void setRecordCode(String recordCode) { this.recordCode = recordCode; }

    public Athlete getAthlete() { return athlete; }
    public void setAthlete(Athlete athlete) { this.athlete = athlete; }

    public Sport getSport() { return sport; }
    public void setSport(Sport sport) { this.sport = sport; }

    public String getMetricName() { return metricName; }
    public void setMetricName(String metricName) { this.metricName = metricName; }

    public Double getMetricValue() { return metricValue; }
    public void setMetricValue(Double metricValue) { this.metricValue = metricValue; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public LocalDate getRecordDate() { return recordDate; }
    public void setRecordDate(LocalDate recordDate) { this.recordDate = recordDate; }

    public RecordContext getContext() { return context; }
    public void setContext(RecordContext context) { this.context = context; }

    public Match getRelatedMatch() { return relatedMatch; }
    public void setRelatedMatch(Match relatedMatch) { this.relatedMatch = relatedMatch; }

    public TrainingSession getRelatedTrainingSession() { return relatedTrainingSession; }
    public void setRelatedTrainingSession(TrainingSession relatedTrainingSession) { this.relatedTrainingSession = relatedTrainingSession; }

    public Event getRelatedEvent() { return relatedEvent; }
    public void setRelatedEvent(Event relatedEvent) { this.relatedEvent = relatedEvent; }

    public Boolean getHigherIsBetter() { return higherIsBetter; }
    public void setHigherIsBetter(Boolean higherIsBetter) { this.higherIsBetter = higherIsBetter; }

    public Boolean getIsPersonalBest() { return isPersonalBest; }
    public void setIsPersonalBest(Boolean isPersonalBest) { this.isPersonalBest = isPersonalBest; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public User getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(User verifiedBy) { this.verifiedBy = verifiedBy; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Integer getCreatedBy() { return createdBy; }
    public void setCreatedBy(Integer createdBy) { this.createdBy = createdBy; }

    public Integer getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(Integer updatedBy) { this.updatedBy = updatedBy; }

    public Boolean getIsDeleted() { return isDeleted; }
    public void setIsDeleted(Boolean isDeleted) { this.isDeleted = isDeleted; }
}
