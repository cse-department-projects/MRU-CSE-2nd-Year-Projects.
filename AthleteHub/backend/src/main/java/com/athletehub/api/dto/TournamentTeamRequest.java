package com.athletehub.api.dto;

public class TournamentTeamRequest {
    private Integer teamId;
    private String notes;

    public TournamentTeamRequest() {}

    public Integer getTeamId() { return teamId; }
    public void setTeamId(Integer teamId) { this.teamId = teamId; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
