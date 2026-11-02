package com.athletehub.api.dto;

import com.athletehub.api.entity.AthleteRegistration;

public class AthleteRegistrationMapper {

    public static AthleteRegistrationResponse toResponse(AthleteRegistration registration) {
        if (registration == null) {
            return null;
        }

        AthleteRegistrationResponse response = new AthleteRegistrationResponse();
        response.setId(registration.getId());
        response.setRegistrationCode(registration.getRegistrationCode());
        
        if (registration.getTournament() != null) {
            response.setTournamentId(registration.getTournament().getId());
            response.setTournamentName(registration.getTournament().getName());
        }
        
        if (registration.getAthlete() != null) {
            response.setAthleteId(registration.getAthlete().getId());
            response.setAthleteName(registration.getAthlete().getFirstName() + " " + registration.getAthlete().getLastName());
        }
        
        response.setRegistrationDate(registration.getRegistrationDate());
        response.setStatus(registration.getStatus() != null ? registration.getStatus().name() : null);
        response.setRemarks(registration.getRemarks());

        return response;
    }
}
