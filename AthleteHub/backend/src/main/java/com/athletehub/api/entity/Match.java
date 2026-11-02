package com.athletehub.api.entity;

import com.athletehub.api.entity.enums.MatchStatus;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "matches", indexes = {
    @Index(name = "idx_match_code", columnList = "match_code"),
    @Index(name = "idx_match_tournament_id", columnList = "tournament_id"),
    @Index(name = "idx_match_date", columnList = "match_date"),
    @Index(name = "idx_match_status", columnList = "status")
})
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "match_code", length = 20, unique = true)
    private String matchCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @Column(name = "match_number")
    private Integer matchNumber;

    @Column(name = "round", length = 50)
    private String round;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_one_id")
    private Athlete participantOne;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_two_id")
    private Athlete participantTwo;

    @Column(name = "venue", length = 150)
    private String venue;

    @Column(name = "match_date")
    private LocalDate matchDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winner_id")
    private Athlete winner;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private MatchStatus status = MatchStatus.SCHEDULED;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private Integer createdBy;

    @Column(name = "updated_by")
    private Integer updatedBy;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "previous_match_one_id")
    private Match previousMatchOne;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "previous_match_two_id")
    private Match previousMatchTwo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "next_match_id")
    private Match nextMatch;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Match() {}

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getMatchCode() { return matchCode; }
    public void setMatchCode(String matchCode) { this.matchCode = matchCode; }

    public Tournament getTournament() { return tournament; }
    public void setTournament(Tournament tournament) { this.tournament = tournament; }

    public Integer getMatchNumber() { return matchNumber; }
    public void setMatchNumber(Integer matchNumber) { this.matchNumber = matchNumber; }

    public String getRound() { return round; }
    public void setRound(String round) { this.round = round; }

    public Athlete getParticipantOne() { return participantOne; }
    public void setParticipantOne(Athlete participantOne) { this.participantOne = participantOne; }

    public Athlete getParticipantTwo() { return participantTwo; }
    public void setParticipantTwo(Athlete participantTwo) { this.participantTwo = participantTwo; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public LocalDate getMatchDate() { return matchDate; }
    public void setMatchDate(LocalDate matchDate) { this.matchDate = matchDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public Athlete getWinner() { return winner; }
    public void setWinner(Athlete winner) { this.winner = winner; }

    public MatchStatus getStatus() { return status; }
    public void setStatus(MatchStatus status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

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

    public Match getPreviousMatchOne() { return previousMatchOne; }
    public void setPreviousMatchOne(Match previousMatchOne) { this.previousMatchOne = previousMatchOne; }

    public Match getPreviousMatchTwo() { return previousMatchTwo; }
    public void setPreviousMatchTwo(Match previousMatchTwo) { this.previousMatchTwo = previousMatchTwo; }

    public Match getNextMatch() { return nextMatch; }
    public void setNextMatch(Match nextMatch) { this.nextMatch = nextMatch; }
}
