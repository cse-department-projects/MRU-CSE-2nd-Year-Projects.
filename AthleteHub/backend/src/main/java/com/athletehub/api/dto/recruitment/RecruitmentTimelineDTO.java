package com.athletehub.api.dto.recruitment;

import java.time.LocalDateTime;

public class RecruitmentTimelineDTO {
    private Integer id;
    private Integer prospectId;
    private String recruiterName;
    private String actionType;
    private String details;
    private LocalDateTime createdAt;
    
    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getProspectId() { return prospectId; }
    public void setProspectId(Integer prospectId) { this.prospectId = prospectId; }
    public String getRecruiterName() { return recruiterName; }
    public void setRecruiterName(String recruiterName) { this.recruiterName = recruiterName; }
    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
