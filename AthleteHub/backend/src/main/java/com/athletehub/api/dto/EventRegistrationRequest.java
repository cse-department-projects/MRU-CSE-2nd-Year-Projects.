package com.athletehub.api.dto;

public class EventRegistrationRequest {
    private Integer athleteId;
    private String remarks;

    public EventRegistrationRequest() {}

    public Integer getAthleteId() { return athleteId; }
    public void setAthleteId(Integer athleteId) { this.athleteId = athleteId; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
