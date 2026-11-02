package com.athletehub.api.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class WellnessCheckInDTO {
    
    private Integer id;
    private Integer athleteId;
    private LocalDate date;
    private Integer sleepQuality;
    private Integer soreness;
    private Integer stress;
    private Integer rpe;
    private String notes;
    private LocalDateTime createdAt;
    
    // Calculate ACWR proxy metrics
    private Double acuteLoad;
    private Double chronicLoad;
    private Double acwr;
    
    public WellnessCheckInDTO() {}
    
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getAthleteId() { return athleteId; }
    public void setAthleteId(Integer athleteId) { this.athleteId = athleteId; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Integer getSleepQuality() { return sleepQuality; }
    public void setSleepQuality(Integer sleepQuality) { this.sleepQuality = sleepQuality; }

    public Integer getSoreness() { return soreness; }
    public void setSoreness(Integer soreness) { this.soreness = soreness; }

    public Integer getStress() { return stress; }
    public void setStress(Integer stress) { this.stress = stress; }

    public Integer getRpe() { return rpe; }
    public void setRpe(Integer rpe) { this.rpe = rpe; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Double getAcuteLoad() { return acuteLoad; }
    public void setAcuteLoad(Double acuteLoad) { this.acuteLoad = acuteLoad; }

    public Double getChronicLoad() { return chronicLoad; }
    public void setChronicLoad(Double chronicLoad) { this.chronicLoad = chronicLoad; }

    public Double getAcwr() { return acwr; }
    public void setAcwr(Double acwr) { this.acwr = acwr; }
}
