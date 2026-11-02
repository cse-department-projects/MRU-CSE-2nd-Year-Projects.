package com.athletehub.api.dto;

public class MatchResultRequest {
    private Integer matchId;
    private Integer athleteId;
    private Integer rank;
    private String score;
    private String medal; // GOLD, SILVER, BRONZE, NONE
    private String remarks;

    // Getters and Setters
    public Integer getMatchId() { return matchId; }
    public void setMatchId(Integer matchId) { this.matchId = matchId; }

    public Integer getAthleteId() { return athleteId; }
    public void setAthleteId(Integer athleteId) { this.athleteId = athleteId; }

    public Integer getRank() { return rank; }
    public void setRank(Integer rank) { this.rank = rank; }

    public String getScore() { return score; }
    public void setScore(String score) { this.score = score; }

    public String getMedal() { return medal; }
    public void setMedal(String medal) { this.medal = medal; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
