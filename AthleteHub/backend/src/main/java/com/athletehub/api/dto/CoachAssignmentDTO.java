package com.athletehub.api.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class CoachAssignmentDTO {
    private Integer id;
    private String assignmentCode;
    private Integer coachId;
    private String coachCode;
    private String coachName;
    private Integer athleteId;
    private String athleteCode;
    private String athleteName;
    private Integer organizationId;
    private String organizationName;
    private String sportName;
    private String sportCategory;
    private String coachSpecialization;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getAssignmentCode() { return assignmentCode; }
    public void setAssignmentCode(String assignmentCode) { this.assignmentCode = assignmentCode; }

    public Integer getCoachId() { return coachId; }
    public void setCoachId(Integer coachId) { this.coachId = coachId; }

    public String getCoachCode() { return coachCode; }
    public void setCoachCode(String coachCode) { this.coachCode = coachCode; }

    public String getCoachName() { return coachName; }
    public void setCoachName(String coachName) { this.coachName = coachName; }

    public Integer getAthleteId() { return athleteId; }
    public void setAthleteId(Integer athleteId) { this.athleteId = athleteId; }

    public String getAthleteCode() { return athleteCode; }
    public void setAthleteCode(String athleteCode) { this.athleteCode = athleteCode; }

    public String getAthleteName() { return athleteName; }
    public void setAthleteName(String athleteName) { this.athleteName = athleteName; }

    public Integer getOrganizationId() { return organizationId; }
    public void setOrganizationId(Integer organizationId) { this.organizationId = organizationId; }

    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }

    public String getSportName() { return sportName; }
    public void setSportName(String sportName) { this.sportName = sportName; }

    public String getSportCategory() { return sportCategory; }
    public void setSportCategory(String sportCategory) { this.sportCategory = sportCategory; }

    public String getCoachSpecialization() { return coachSpecialization; }
    public void setCoachSpecialization(String coachSpecialization) { this.coachSpecialization = coachSpecialization; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
