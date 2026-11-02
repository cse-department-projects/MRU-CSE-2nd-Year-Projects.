package com.athletehub.api.dto;

import java.time.LocalDateTime;

public class TrainingAttendanceDTO {
    private Integer id;
    private String attendanceCode;
    private Integer trainingSessionId;
    private String trainingSessionTitle;
    private Integer athleteId;
    private String athleteName;
    private String attendanceStatus;
    private String coachNotes;
    private String athleteFeedback;
    private String injuryReport;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getAttendanceCode() { return attendanceCode; }
    public void setAttendanceCode(String attendanceCode) { this.attendanceCode = attendanceCode; }

    public Integer getTrainingSessionId() { return trainingSessionId; }
    public void setTrainingSessionId(Integer trainingSessionId) { this.trainingSessionId = trainingSessionId; }

    public String getTrainingSessionTitle() { return trainingSessionTitle; }
    public void setTrainingSessionTitle(String trainingSessionTitle) { this.trainingSessionTitle = trainingSessionTitle; }

    public Integer getAthleteId() { return athleteId; }
    public void setAthleteId(Integer athleteId) { this.athleteId = athleteId; }

    public String getAthleteName() { return athleteName; }
    public void setAthleteName(String athleteName) { this.athleteName = athleteName; }

    public String getAttendanceStatus() { return attendanceStatus; }
    public void setAttendanceStatus(String attendanceStatus) { this.attendanceStatus = attendanceStatus; }

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
