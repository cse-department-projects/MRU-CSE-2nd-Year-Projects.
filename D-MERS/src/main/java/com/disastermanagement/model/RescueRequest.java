package com.disastermanagement.model;

import java.sql.Timestamp;
import java.time.LocalDateTime;

public class RescueRequest {
    public enum RequestPriority {
        LOW, MEDIUM, HIGH, CRITICAL;
        public static RequestPriority fromString(String text) {
            if (text == null) return MEDIUM;
            for (RequestPriority p : values()) {
                if (p.name().equalsIgnoreCase(text)) return p;
            }
            return MEDIUM;
        }
    }

    public enum RequestStatus {
        PENDING, ASSIGNED, ACCEPTED, IN_PROGRESS, COMPLETED, CANCELLED;
        public static RequestStatus fromString(String text) {
            if (text == null) return PENDING;
            for (RequestStatus s : values()) {
                if (s.name().equalsIgnoreCase(text)) return s;
            }
            return PENDING;
        }
    }

    private int requestId;
    private int disasterReportId;
    private int citizenId;
    private String citizenName;
    private String contactNumber;
    private String location;
    private String emergencyType;
    private int numPeople;
    private String description;
    private boolean medicalAssistanceRequired;
    private int priorityScore;
    private RequestPriority priority;
    private RequestStatus status;
    private Integer assignedTeamId;
    private String assignedTeamName;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public RescueRequest() {
        this.status = RequestStatus.PENDING;
        this.createdAt = new Timestamp(System.currentTimeMillis());
        this.updatedAt = new Timestamp(System.currentTimeMillis());
        this.numPeople = 1;
        this.priorityScore = 50;
        this.priority = RequestPriority.MEDIUM;
    }

    public RescueRequest(int requestId, int citizenId, String contactNumber, String location, String emergencyType, int numPeople, String description, RequestPriority priority, RequestStatus status, Integer assignedTeamId, Timestamp createdAt, Timestamp updatedAt) {
        this.requestId = requestId;
        this.citizenId = citizenId;
        this.contactNumber = contactNumber;
        this.location = location;
        this.emergencyType = emergencyType;
        this.numPeople = numPeople;
        this.description = description;
        this.priority = priority;
        this.status = status;
        this.assignedTeamId = assignedTeamId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.priorityScore = 50;
    }

    // Getters & Setters
    public int getRequestId() { return requestId; }
    public void setRequestId(int requestId) { this.requestId = requestId; }

    public int getDisasterReportId() { return disasterReportId; }
    public void setDisasterReportId(int disasterReportId) { this.disasterReportId = disasterReportId; }

    public int getCitizenId() { return citizenId; }
    public void setCitizenId(int citizenId) { this.citizenId = citizenId; }

    public String getCitizenName() { return citizenName; }
    public void setCitizenName(String citizenName) { this.citizenName = citizenName; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getEmergencyType() { return emergencyType; }
    public void setEmergencyType(String emergencyType) { this.emergencyType = emergencyType; }

    public int getNumPeople() { return numPeople; }
    public void setNumPeople(int numPeople) { this.numPeople = numPeople; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isMedicalAssistanceRequired() { return medicalAssistanceRequired; }
    public void setMedicalAssistanceRequired(boolean medicalAssistanceRequired) { this.medicalAssistanceRequired = medicalAssistanceRequired; }

    public int getPriorityScore() { return priorityScore; }
    public void setPriorityScore(int priorityScore) { this.priorityScore = priorityScore; }

    public RequestPriority getPriority() { return priority; }
    public void setPriority(RequestPriority priority) { this.priority = priority; }

    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }

    public Integer getAssignedTeamId() { return assignedTeamId; }
    public void setAssignedTeamId(Integer assignedTeamId) { this.assignedTeamId = assignedTeamId; }

    public String getAssignedTeamName() { return assignedTeamName; }
    public void setAssignedTeamName(String assignedTeamName) { this.assignedTeamName = assignedTeamName; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getCreatedAtLocalDateTime() {
        return createdAt != null ? createdAt.toLocalDateTime() : LocalDateTime.now();
    }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }
}
