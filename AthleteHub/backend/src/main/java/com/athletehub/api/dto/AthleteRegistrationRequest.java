package com.athletehub.api.dto;

public class AthleteRegistrationRequest {
    private Integer tournamentId;
    private Integer athleteId;
    private String remarks;

    // Getters and Setters
    public Integer getTournamentId() { return tournamentId; }
    public void setTournamentId(Integer tournamentId) { this.tournamentId = tournamentId; }

    public Integer getAthleteId() { return athleteId; }
    public void setAthleteId(Integer athleteId) { this.athleteId = athleteId; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
