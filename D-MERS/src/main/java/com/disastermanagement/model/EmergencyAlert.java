package com.disastermanagement.model;

import java.sql.Timestamp;

public class EmergencyAlert {
    private int alertId;
    private String title;
    private String message;
    private DisasterReport.DisasterType disasterType;
    private DisasterReport.Severity severity;
    private boolean isActive;
    private Timestamp createdAt;

    public EmergencyAlert() {}

    public EmergencyAlert(int alertId, String title, String message, DisasterReport.DisasterType disasterType, DisasterReport.Severity severity, boolean isActive, Timestamp createdAt) {
        this.alertId = alertId;
        this.title = title;
        this.message = message;
        this.disasterType = disasterType;
        this.severity = severity;
        this.isActive = isActive;
        this.createdAt = createdAt;
    }

    // Getters & Setters
    public int getAlertId() { return alertId; }
    public void setAlertId(int alertId) { this.alertId = alertId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public DisasterReport.DisasterType getDisasterType() { return disasterType; }
    public void setDisasterType(DisasterReport.DisasterType disasterType) { this.disasterType = disasterType; }

    public DisasterReport.Severity getSeverity() { return severity; }
    public void setSeverity(DisasterReport.Severity severity) { this.severity = severity; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
