package com.disastermanagement.model;

import java.sql.Timestamp;

public class VolunteerTask {
    public enum TaskStatus {
        OPEN, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED;
        public static TaskStatus fromString(String text) {
            if (text == null) return OPEN;
            for (TaskStatus s : values()) {
                if (s.name().equalsIgnoreCase(text)) return s;
            }
            return OPEN;
        }
    }

    private int taskId;
    private String title;
    private String description;
    private String location;
    private Volunteer.Skill requiredSkill;
    private Integer disasterReportId;
    private Integer assignedVolunteerId;
    private String assignedVolunteerName;
    private TaskStatus status;
    private Timestamp createdAt;

    public VolunteerTask() {}

    public VolunteerTask(int taskId, String title, String description, String location, Volunteer.Skill requiredSkill, Integer disasterReportId, Integer assignedVolunteerId, TaskStatus status, Timestamp createdAt) {
        this.taskId = taskId;
        this.title = title;
        this.description = description;
        this.location = location;
        this.requiredSkill = requiredSkill;
        this.disasterReportId = disasterReportId;
        this.assignedVolunteerId = assignedVolunteerId;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Getters & Setters
    public int getTaskId() { return taskId; }
    public void setTaskId(int taskId) { this.taskId = taskId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Volunteer.Skill getRequiredSkill() { return requiredSkill; }
    public void setRequiredSkill(Volunteer.Skill requiredSkill) { this.requiredSkill = requiredSkill; }

    public Integer getDisasterReportId() { return disasterReportId; }
    public void setDisasterReportId(Integer disasterReportId) { this.disasterReportId = disasterReportId; }

    public Integer getAssignedVolunteerId() { return assignedVolunteerId; }
    public void setAssignedVolunteerId(Integer assignedVolunteerId) { this.assignedVolunteerId = assignedVolunteerId; }

    public String getAssignedVolunteerName() { return assignedVolunteerName; }
    public void setAssignedVolunteerName(String assignedVolunteerName) { this.assignedVolunteerName = assignedVolunteerName; }

    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
