package com.athletehub.api.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class TrainingSessionRequest {
    private Integer trainingPlanId;
    private Integer teamId;
    private Integer coachAssignmentId;
    private String title;

    public Integer getTeamId() { return teamId; }
    public void setTeamId(Integer teamId) { this.teamId = teamId; }
    private String description;
    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String venue;
    private String sessionType;
    private String intensity;
    private String status;
    private String remarks;

    public Integer getTrainingPlanId() { return trainingPlanId; }
    public void setTrainingPlanId(Integer trainingPlanId) { this.trainingPlanId = trainingPlanId; }

    public Integer getCoachAssignmentId() { return coachAssignmentId; }
    public void setCoachAssignmentId(Integer coachAssignmentId) { this.coachAssignmentId = coachAssignmentId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getSessionDate() { return sessionDate; }
    public void setSessionDate(LocalDate sessionDate) { this.sessionDate = sessionDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public String getSessionType() { return sessionType; }
    public void setSessionType(String sessionType) { this.sessionType = sessionType; }

    public String getIntensity() { return intensity; }
    public void setIntensity(String intensity) { this.intensity = intensity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
