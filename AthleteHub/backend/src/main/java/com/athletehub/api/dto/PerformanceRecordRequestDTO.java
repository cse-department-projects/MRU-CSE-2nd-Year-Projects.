package com.athletehub.api.dto;

import java.time.LocalDate;

public class PerformanceRecordRequestDTO {

    private Integer athleteId;
    private Integer sportId;
    private String metricName;
    private Double metricValue;
    private String unit;
    private LocalDate recordDate;
    private String context;
    private Integer relatedMatchId;
    private Integer relatedTrainingSessionId;
    private Integer relatedEventId;
    private Boolean higherIsBetter;
    private Boolean isVerified;
    private Integer verifiedById;
    private String notes;

    // Getters and Setters
    public Integer getAthleteId() { return athleteId; }
    public void setAthleteId(Integer athleteId) { this.athleteId = athleteId; }

    public Integer getSportId() { return sportId; }
    public void setSportId(Integer sportId) { this.sportId = sportId; }

    public String getMetricName() { return metricName; }
    public void setMetricName(String metricName) { this.metricName = metricName; }

    public Double getMetricValue() { return metricValue; }
    public void setMetricValue(Double metricValue) { this.metricValue = metricValue; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public LocalDate getRecordDate() { return recordDate; }
    public void setRecordDate(LocalDate recordDate) { this.recordDate = recordDate; }

    public String getContext() { return context; }
    public void setContext(String context) { this.context = context; }

    public Integer getRelatedMatchId() { return relatedMatchId; }
    public void setRelatedMatchId(Integer relatedMatchId) { this.relatedMatchId = relatedMatchId; }

    public Integer getRelatedTrainingSessionId() { return relatedTrainingSessionId; }
    public void setRelatedTrainingSessionId(Integer relatedTrainingSessionId) { this.relatedTrainingSessionId = relatedTrainingSessionId; }

    public Integer getRelatedEventId() { return relatedEventId; }
    public void setRelatedEventId(Integer relatedEventId) { this.relatedEventId = relatedEventId; }

    public Boolean getHigherIsBetter() { return higherIsBetter; }
    public void setHigherIsBetter(Boolean higherIsBetter) { this.higherIsBetter = higherIsBetter; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public Integer getVerifiedById() { return verifiedById; }
    public void setVerifiedById(Integer verifiedById) { this.verifiedById = verifiedById; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
