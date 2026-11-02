package com.athletehub.api.dto;

import java.time.LocalDate;

public class TournamentRequest {
    private String name;
    private Integer eventId;
    private Integer sportId;
    private String genderCategory;
    private String ageCategory;
    private Integer maxParticipants;
    private Integer registrationLimit;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getEventId() { return eventId; }
    public void setEventId(Integer eventId) { this.eventId = eventId; }

    public Integer getSportId() { return sportId; }
    public void setSportId(Integer sportId) { this.sportId = sportId; }

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
}
