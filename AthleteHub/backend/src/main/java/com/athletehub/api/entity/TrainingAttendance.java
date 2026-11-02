package com.athletehub.api.entity;

import com.athletehub.api.entity.enums.AttendanceStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "training_attendance")
public class TrainingAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "attendance_code", length = 20, unique = true)
    private String attendanceCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_session_id", nullable = false)
    private TrainingSession trainingSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "athlete_id", nullable = false)
    private Athlete athlete;

    @Enumerated(EnumType.STRING)
    @Column(name = "attendance_status", length = 20, nullable = false)
    private AttendanceStatus attendanceStatus;

    @Column(name = "coach_notes", columnDefinition = "TEXT")
    private String coachNotes;

    @Column(name = "athlete_feedback", columnDefinition = "TEXT")
    private String athleteFeedback;

    @Column(name = "injury_report", columnDefinition = "TEXT")
    private String injuryReport;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public TrainingAttendance() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getAttendanceCode() { return attendanceCode; }
    public void setAttendanceCode(String attendanceCode) { this.attendanceCode = attendanceCode; }

    public TrainingSession getTrainingSession() { return trainingSession; }
    public void setTrainingSession(TrainingSession trainingSession) { this.trainingSession = trainingSession; }

    public Athlete getAthlete() { return athlete; }
    public void setAthlete(Athlete athlete) { this.athlete = athlete; }

    public AttendanceStatus getAttendanceStatus() { return attendanceStatus; }
    public void setAttendanceStatus(AttendanceStatus attendanceStatus) { this.attendanceStatus = attendanceStatus; }

    public String getCoachNotes() { return coachNotes; }
    public void setCoachNotes(String coachNotes) { this.coachNotes = coachNotes; }

    public String getAthleteFeedback() { return athleteFeedback; }
    public void setAthleteFeedback(String athleteFeedback) { this.athleteFeedback = athleteFeedback; }

    public String getInjuryReport() { return injuryReport; }
    public void setInjuryReport(String injuryReport) { this.injuryReport = injuryReport; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
