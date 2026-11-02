package com.athletehub.api.dto;

import java.util.List;

public class TeamMemberRequest {
    private Integer athleteId;
    private List<Integer> athleteIds;
    private String role;
    private String position;
    private Integer jerseyNumber;
    private String status;
    private String notes;

    public Integer getAthleteId() { return athleteId; }
    public void setAthleteId(Integer athleteId) { this.athleteId = athleteId; }

    public List<Integer> getAthleteIds() { return athleteIds; }
    public void setAthleteIds(List<Integer> athleteIds) { this.athleteIds = athleteIds; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public Integer getJerseyNumber() { return jerseyNumber; }
    public void setJerseyNumber(Integer jerseyNumber) { this.jerseyNumber = jerseyNumber; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
