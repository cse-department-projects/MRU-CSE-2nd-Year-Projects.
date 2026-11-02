package com.athletehub.api.dto;

import com.athletehub.api.entity.EventRegistration;

public class EventRegistrationMapper {

    public static EventRegistrationResponse toResponse(EventRegistration reg) {
        if (reg == null) return null;

        EventRegistrationResponse resp = new EventRegistrationResponse();
        resp.setId(reg.getId());
        resp.setRegistrationCode(reg.getRegistrationCode());
        if (reg.getEvent() != null) {
            resp.setEventId(reg.getEvent().getId());
            resp.setEventName(reg.getEvent().getName());
        }
        if (reg.getAthlete() != null) {
            resp.setAthleteId(reg.getAthlete().getId());
            resp.setAthleteName(reg.getAthlete().getFirstName() + " " + reg.getAthlete().getLastName());
            resp.setAthleteCode(reg.getAthlete().getAthleteCode());
            resp.setGender(reg.getAthlete().getGender());
            if (reg.getAthlete().getDateOfBirth() != null) {
                resp.setDateOfBirth(reg.getAthlete().getDateOfBirth().toString());
                resp.setAge(java.time.Period.between(reg.getAthlete().getDateOfBirth(), java.time.LocalDate.now()).getYears());
            }
            if (reg.getAthlete().getSport() != null) {
                resp.setPrimarySport(reg.getAthlete().getSport().getName());
            }
        }
        resp.setRegistrationDate(reg.getRegistrationDate());
        resp.setStatus(reg.getStatus());
        resp.setRemarks(reg.getRemarks());

        return resp;
    }
}
