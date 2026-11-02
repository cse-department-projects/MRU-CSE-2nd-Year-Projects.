package com.athletehub.api.dto;

import java.time.LocalDateTime;

public class EventRegistrationResponse {
    private Integer id;
    private String registrationCode;
    private Integer eventId;
    private String eventName;
    private Integer athleteId;
    private String athleteName;
    private String athleteCode;
    private String gender;
    private String dateOfBirth;
    private Integer age;
    private String primarySport;
    private LocalDateTime registrationDate;
    private String status;
    private String remarks;

    public EventRegistrationResponse() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getRegistrationCode() { return registrationCode; }
    public void setRegistrationCode(String registrationCode) { this.registrationCode = registrationCode; }

    public Integer getEventId() { return eventId; }
    public void setEventId(Integer eventId) { this.eventId = eventId; }

    public String getEventName() { return eventName; }
    public void setEventName(String eventName) { this.eventName = eventName; }

    public Integer getAthleteId() { return athleteId; }
    public void setAthleteId(Integer athleteId) { this.athleteId = athleteId; }

    public String getAthleteName() { return athleteName; }
    public void setAthleteName(String athleteName) { this.athleteName = athleteName; }

    public String getAthleteCode() { return athleteCode; }
    public void setAthleteCode(String athleteCode) { this.athleteCode = athleteCode; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getPrimarySport() { return primarySport; }
    public void setPrimarySport(String primarySport) { this.primarySport = primarySport; }

    public LocalDateTime getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(LocalDateTime registrationDate) { this.registrationDate = registrationDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
