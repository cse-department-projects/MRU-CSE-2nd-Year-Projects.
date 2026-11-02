package com.athletehub.api.dto;

import java.time.LocalDate;

public class CoachEvaluationRequestDTO {

    private Integer coachId;
    private Integer evaluatorId;
    private LocalDate evaluationDate;
    private Double score;
    private String criteriaSummary;
    private String comments;

    // Getters and Setters
    public Integer getCoachId() { return coachId; }
    public void setCoachId(Integer coachId) { this.coachId = coachId; }

    public Integer getEvaluatorId() { return evaluatorId; }
    public void setEvaluatorId(Integer evaluatorId) { this.evaluatorId = evaluatorId; }

    public LocalDate getEvaluationDate() { return evaluationDate; }
    public void setEvaluationDate(LocalDate evaluationDate) { this.evaluationDate = evaluationDate; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public String getCriteriaSummary() { return criteriaSummary; }
    public void setCriteriaSummary(String criteriaSummary) { this.criteriaSummary = criteriaSummary; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
}
