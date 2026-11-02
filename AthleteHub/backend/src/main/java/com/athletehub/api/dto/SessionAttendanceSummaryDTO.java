package com.athletehub.api.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class SessionAttendanceSummaryDTO {
    private Integer sessionId;
    private String sessionCode;
    private String title;
    private Integer teamId;
    private String teamName;
    private Integer trainingPlanId;
    private String trainingPlanTitle;
    private String coachName;
    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String venue;
    private String status;
    private String intensity;
    private long totalRecorded;
    private long presentCount;
    private long lateCount;
    private long excusedCount;
    private long absentCount;
    private double attendanceRate;
    private List<TrainingAttendanceDTO> records;

    public Integer getSessionId() { return sessionId; }
    public void setSessionId(Integer sessionId) { this.sessionId = sessionId; }

    public String getSessionCode() { return sessionCode; }
    public void setSessionCode(String sessionCode) { this.sessionCode = sessionCode; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Integer getTeamId() { return teamId; }
    public void setTeamId(Integer teamId) { this.teamId = teamId; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public Integer getTrainingPlanId() { return trainingPlanId; }
    public void setTrainingPlanId(Integer trainingPlanId) { this.trainingPlanId = trainingPlanId; }

    public String getTrainingPlanTitle() { return trainingPlanTitle; }
    public void setTrainingPlanTitle(String trainingPlanTitle) { this.trainingPlanTitle = trainingPlanTitle; }

    public String getCoachName() { return coachName; }
    public void setCoachName(String coachName) { this.coachName = coachName; }

    public LocalDate getSessionDate() { return sessionDate; }
    public void setSessionDate(LocalDate sessionDate) { this.sessionDate = sessionDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getIntensity() { return intensity; }
    public void setIntensity(String intensity) { this.intensity = intensity; }

    public long getTotalRecorded() { return totalRecorded; }
    public void setTotalRecorded(long totalRecorded) { this.totalRecorded = totalRecorded; }

    public long getPresentCount() { return presentCount; }
    public void setPresentCount(long presentCount) { this.presentCount = presentCount; }

    public long getLateCount() { return lateCount; }
    public void setLateCount(long lateCount) { this.lateCount = lateCount; }

    public long getExcusedCount() { return excusedCount; }
    public void setExcusedCount(long excusedCount) { this.excusedCount = excusedCount; }

    public long getAbsentCount() { return absentCount; }
    public void setAbsentCount(long absentCount) { this.absentCount = absentCount; }

    public double getAttendanceRate() { return attendanceRate; }
    public void setAttendanceRate(double attendanceRate) { this.attendanceRate = attendanceRate; }

    public List<TrainingAttendanceDTO> getRecords() { return records; }
    public void setRecords(List<TrainingAttendanceDTO> records) { this.records = records; }
}
