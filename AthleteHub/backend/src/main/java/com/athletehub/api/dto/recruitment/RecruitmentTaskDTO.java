package com.athletehub.api.dto.recruitment;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class RecruitmentTaskDTO {
    private Integer id;
    private String title;
    private String description;
    private String status;
    private String priority;
    private LocalDate dueDate;
    private Integer recruiterId;
    private Integer prospectId;
    private String prospectName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public Integer getRecruiterId() { return recruiterId; }
    public void setRecruiterId(Integer recruiterId) { this.recruiterId = recruiterId; }
    public Integer getProspectId() { return prospectId; }
    public void setProspectId(Integer prospectId) { this.prospectId = prospectId; }
    public String getProspectName() { return prospectName; }
    public void setProspectName(String prospectName) { this.prospectName = prospectName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
