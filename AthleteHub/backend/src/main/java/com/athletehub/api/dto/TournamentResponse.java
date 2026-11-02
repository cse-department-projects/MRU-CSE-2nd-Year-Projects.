package com.athletehub.api.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class TournamentResponse {
    private Integer id;
    private String tournamentCode;
    private String name;
    private Integer eventId;
    private String eventName;
    private Integer sportId;
    private String sportName;
    private String genderCategory;
    private String ageCategory;
    private Integer maxParticipants;
    private Integer registrationLimit;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getTournamentCode() { return tournamentCode; }
    public void setTournamentCode(String tournamentCode) { this.tournamentCode = tournamentCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getEventId() { return eventId; }
    public void setEventId(Integer eventId) { this.eventId = eventId; }

    public String getEventName() { return eventName; }
    public void setEventName(String eventName) { this.eventName = eventName; }

    public Integer getSportId() { return sportId; }
    public void setSportId(Integer sportId) { this.sportId = sportId; }

    public String getSportName() { return sportName; }
    public void setSportName(String sportName) { this.sportName = sportName; }

    public String getGenderCategory() { return genderCategory; }
    public void setGenderCategory(String genderCategory) { this.genderCategory = genderCategory; }

    public String getAgeCategory() { return ageCategory; }
    public void setAgeCategory(String ageCategory) { this.ageCategory = ageCategory; }

    public Integer getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }

    public Integer getRegistrationLimit() { return registrationLimit; }
    public void setRegistrationLimit(Integer registrationLimit) { this.registrationLimit = registrationLimit; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
