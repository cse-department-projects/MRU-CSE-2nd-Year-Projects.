package com.disastermanagement.model;

import java.time.LocalDateTime;

public class EmergencyTimeline {
    private int id;
    private int rescueRequestId;
    private String eventType; // CREATED, PRIORITY_CALCULATED, TEAM_ASSIGNED, ACCEPTED, OPERATION_STARTED, COMPLETED, STATUS_CHANGE
    private String description;
    private String createdBy;
    private LocalDateTime createdAt;

    public EmergencyTimeline() {
        this.createdAt = LocalDateTime.now();
    }

    public EmergencyTimeline(int rescueRequestId, String eventType, String description, String createdBy) {
        this.rescueRequestId = rescueRequestId;
        this.eventType = eventType;
        this.description = description;
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getRescueRequestId() { return rescueRequestId; }
    public void setRescueRequestId(int rescueRequestId) { this.rescueRequestId = rescueRequestId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
