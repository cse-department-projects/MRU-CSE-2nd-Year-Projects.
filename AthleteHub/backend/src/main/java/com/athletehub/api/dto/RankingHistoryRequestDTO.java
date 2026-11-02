package com.athletehub.api.dto;

import java.time.LocalDate;

public class RankingHistoryRequestDTO {

    private Integer athleteId;
    private Integer sportId;
    private String category;
    private Integer rankPosition;
    private Double score;
    private LocalDate dateRecorded;

    // Getters and Setters
    public Integer getAthleteId() { return athleteId; }
    public void setAthleteId(Integer athleteId) { this.athleteId = athleteId; }

    public Integer getSportId() { return sportId; }
    public void setSportId(Integer sportId) { this.sportId = sportId; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getRankPosition() { return rankPosition; }
    public void setRankPosition(Integer rankPosition) { this.rankPosition = rankPosition; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public LocalDate getDateRecorded() { return dateRecorded; }
    public void setDateRecorded(LocalDate dateRecorded) { this.dateRecorded = dateRecorded; }
}
