package com.smartvillage.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "emergency_alerts")
public class EmergencyAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String alertTitle;

    @Column(length = 20)
    private String severity = "HIGH"; // MODERATE, HIGH, CRITICAL

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    private LocalDateTime broadcastDate = LocalDateTime.now();

    private Boolean active = true;

    public EmergencyAlert() {}

    public EmergencyAlert(String alertTitle, String severity, String message) {
        this.alertTitle = alertTitle;
        this.severity = severity;
        this.message = message;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAlertTitle() { return alertTitle; }
    public void setAlertTitle(String alertTitle) { this.alertTitle = alertTitle; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getBroadcastDate() { return broadcastDate; }
    public void setBroadcastDate(LocalDateTime broadcastDate) { this.broadcastDate = broadcastDate; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
