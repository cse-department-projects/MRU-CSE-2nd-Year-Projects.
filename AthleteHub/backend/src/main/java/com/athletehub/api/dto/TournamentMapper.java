package com.athletehub.api.dto;

import com.athletehub.api.entity.Tournament;

public class TournamentMapper {

    public static TournamentResponse toResponse(Tournament tournament) {
        if (tournament == null) {
            return null;
        }

        TournamentResponse response = new TournamentResponse();
        response.setId(tournament.getId());
        response.setTournamentCode(tournament.getTournamentCode());
        response.setName(tournament.getName());
        
        if (tournament.getEvent() != null) {
            response.setEventId(tournament.getEvent().getId());
            response.setEventName(tournament.getEvent().getName());
        }
        
        if (tournament.getSport() != null) {
            response.setSportId(tournament.getSport().getId());
            response.setSportName(tournament.getSport().getName());
        }
        
        response.setGenderCategory(tournament.getGenderCategory());
        response.setAgeCategory(tournament.getAgeCategory());
        response.setMaxParticipants(tournament.getMaxParticipants());
        response.setRegistrationLimit(tournament.getRegistrationLimit());
        response.setStartDate(tournament.getStartDate());
        response.setEndDate(tournament.getEndDate());
        response.setStatus(tournament.getStatus() != null ? tournament.getStatus().name() : null);
        response.setCreatedAt(tournament.getCreatedAt());
        response.setUpdatedAt(tournament.getUpdatedAt());

        return response;
    }
}
