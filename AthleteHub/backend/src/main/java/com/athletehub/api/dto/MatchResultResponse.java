package com.athletehub.api.dto;

public class MatchResultResponse {
    private Integer id;
    private String resultCode;
    private Integer matchId;
    private Integer athleteId;
    private String athleteName;
    private Integer rank;
    private String score;
    private String medal;
    private String remarks;

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getResultCode() { return resultCode; }
    public void setResultCode(String resultCode) { this.resultCode = resultCode; }

    public Integer getMatchId() { return matchId; }
    public void setMatchId(Integer matchId) { this.matchId = matchId; }

    public Integer getAthleteId() { return athleteId; }
    public void setAthleteId(Integer athleteId) { this.athleteId = athleteId; }

    public String getAthleteName() { return athleteName; }
    public void setAthleteName(String athleteName) { this.athleteName = athleteName; }

    public Integer getRank() { return rank; }
    public void setRank(Integer rank) { this.rank = rank; }

    public String getScore() { return score; }
    public void setScore(String score) { this.score = score; }

    public String getMedal() { return medal; }
    public void setMedal(String medal) { this.medal = medal; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
