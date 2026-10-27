package com.disastermanagement.model;

import java.sql.Timestamp;
import java.time.LocalDateTime;

public class DisasterReport {
    public enum DisasterType {
        FLOOD("Flood"),
        EARTHQUAKE("Earthquake"),
        CYCLONE("Cyclone"),
        FIRE("Fire"),
        LANDSLIDE("Landslide"),
        COLLAPSE("Building Collapse"),
        OTHER("Other Emergency");

        private final String label;
        DisasterType(String label) { this.label = label; }
        public String getLabel() { return label; }
        public static DisasterType fromString(String text) {
            if (text == null) return OTHER;
            for (DisasterType dt : values()) {
                if (dt.name().equalsIgnoreCase(text) || dt.getLabel().equalsIgnoreCase(text)) return dt;
            }
            return OTHER;
        }
    }

    public enum Severity {
        LOW("Low"),
        MEDIUM("Medium"),
        HIGH("High"),
        CRITICAL("Critical");

        private final String label;
        Severity(String label) { this.label = label; }
        public String getLabel() { return label; }
        public static Severity fromString(String text) {
            if (text == null) return MEDIUM;
            for (Severity s : values()) {
                if (s.name().equalsIgnoreCase(text) || s.getLabel().equalsIgnoreCase(text)) return s;
            }
            return MEDIUM;
        }
    }

    public enum ReportStatus {
        REPORTED, VERIFIED, IN_ACTION, RESOLVED, REJECTED;
        public static ReportStatus fromString(String text) {
            if (text == null) return REPORTED;
            for (ReportStatus s : values()) {
                if (s.name().equalsIgnoreCase(text)) return s;
            }
            return REPORTED;
        }
    }

    private int reportId;
    private int citizenId;
    private String citizenName;
    private DisasterType disasterType;
    private String location;
    private Severity severity;
    private String description;
    private int affectedPeople;
    private int peopleNeedingHelp;
    private int priorityScore;
    private String contactNumber;
    private Timestamp reportDate;
    private ReportStatus status;
    private String imagePath;

    public DisasterReport() {
        this.status = ReportStatus.REPORTED;
        this.reportDate = new Timestamp(System.currentTimeMillis());
        this.affectedPeople = 1;
        this.peopleNeedingHelp = 1;
        this.priorityScore = 50;
    }

    public DisasterReport(int reportId, int citizenId, DisasterType disasterType, String location, Severity severity, String description, Timestamp reportDate, ReportStatus status, String imagePath) {
        this.reportId = reportId;
        this.citizenId = citizenId;
        this.disasterType = disasterType;
        this.location = location;
        this.severity = severity;
        this.description = description;
        this.reportDate = reportDate;
        this.status = status;
        this.imagePath = imagePath;
        this.affectedPeople = 1;
        this.peopleNeedingHelp = 1;
        this.priorityScore = 50;
    }

    // Getters & Setters
    public int getReportId() { return reportId; }
    public void setReportId(int reportId) { this.reportId = reportId; }

    public int getCitizenId() { return citizenId; }
    public void setCitizenId(int citizenId) { this.citizenId = citizenId; }

    public String getCitizenName() { return citizenName; }
    public void setCitizenName(String citizenName) { this.citizenName = citizenName; }

    public DisasterType getDisasterTypeEnum() { return disasterType; }
    public String getDisasterType() { return disasterType != null ? disasterType.getLabel() : "Other Emergency"; }
    public void setDisasterType(DisasterType disasterType) { this.disasterType = disasterType; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Severity getSeverityEnum() { return severity; }
    public String getSeverity() { return severity != null ? severity.getLabel() : "Medium"; }
    public void setSeverity(Severity severity) { this.severity = severity; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getAffectedPeople() { return affectedPeople; }
    public void setAffectedPeople(int affectedPeople) { this.affectedPeople = affectedPeople; }

    public int getPeopleNeedingHelp() { return peopleNeedingHelp; }
    public void setPeopleNeedingHelp(int peopleNeedingHelp) { this.peopleNeedingHelp = peopleNeedingHelp; }

    public int getPriorityScore() { return priorityScore; }
    public void setPriorityScore(int priorityScore) { this.priorityScore = priorityScore; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public Timestamp getReportDate() { return reportDate; }
    public void setReportDate(Timestamp reportDate) { this.reportDate = reportDate; }

    public LocalDateTime getCreatedAt() {
        return reportDate != null ? reportDate.toLocalDateTime() : LocalDateTime.now();
    }

    public ReportStatus getStatusEnum() { return status; }
    public String getStatus() { return status != null ? status.name() : "REPORTED"; }
    public void setStatus(ReportStatus status) { this.status = status; }

    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }
}
