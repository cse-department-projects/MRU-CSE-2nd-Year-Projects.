package com.athletehub.api.dto;

import java.time.LocalDate;

public class CoachEvaluationResponseDTO {

    private Integer id;
    private String evaluationCode;
    private Integer coachId;
    private String coachName;
    private Integer evaluatorId;
    private String evaluatorName;
    private LocalDate evaluationDate;
    private Double score;
    private String criteriaSummary;
    private String comments;

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getEvaluationCode() { return evaluationCode; }
    public void setEvaluationCode(String evaluationCode) { this.evaluationCode = evaluationCode; }

    public Integer getCoachId() { return coachId; }
    public void setCoachId(Integer coachId) { this.coachId = coachId; }

    public String getCoachName() { return coachName; }
    public void setCoachName(String coachName) { this.coachName = coachName; }

    public Integer getEvaluatorId() { return evaluatorId; }
    public void setEvaluatorId(Integer evaluatorId) { this.evaluatorId = evaluatorId; }

    public String getEvaluatorName() { return evaluatorName; }
    public void setEvaluatorName(String evaluatorName) { this.evaluatorName = evaluatorName; }

    public LocalDate getEvaluationDate() { return evaluationDate; }
    public void setEvaluationDate(LocalDate evaluationDate) { this.evaluationDate = evaluationDate; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public String getCriteriaSummary() { return criteriaSummary; }
    public void setCriteriaSummary(String criteriaSummary) { this.criteriaSummary = criteriaSummary; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
}
