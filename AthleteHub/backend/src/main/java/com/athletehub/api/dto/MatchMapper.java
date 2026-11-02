package com.athletehub.api.dto;

import com.athletehub.api.entity.Match;

public class MatchMapper {

    public static MatchResponse toResponse(Match match) {
        if (match == null) {
            return null;
        }

        MatchResponse response = new MatchResponse();
        response.setId(match.getId());
        response.setMatchCode(match.getMatchCode());
        
        if (match.getTournament() != null) {
            response.setTournamentId(match.getTournament().getId());
            response.setTournamentName(match.getTournament().getName());
            if (match.getTournament().getEvent() != null) {
                response.setEventId(match.getTournament().getEvent().getId());
                response.setEventName(match.getTournament().getEvent().getName());
            }
        }
        
        response.setMatchNumber(match.getMatchNumber());
        response.setRound(match.getRound());
        
        if (match.getParticipantOne() != null) {
            response.setParticipantOneId(match.getParticipantOne().getId());
            response.setParticipantOneName(match.getParticipantOne().getFirstName() + " " + match.getParticipantOne().getLastName());
        }
        
        if (match.getParticipantTwo() != null) {
            response.setParticipantTwoId(match.getParticipantTwo().getId());
            response.setParticipantTwoName(match.getParticipantTwo().getFirstName() + " " + match.getParticipantTwo().getLastName());
        }
        
        response.setVenue(match.getVenue());
        response.setMatchDate(match.getMatchDate());
        response.setStartTime(match.getStartTime());
        response.setEndTime(match.getEndTime());
        
        if (match.getWinner() != null) {
            response.setWinnerId(match.getWinner().getId());
            response.setWinnerName(match.getWinner().getFirstName() + " " + match.getWinner().getLastName());
        }
        
        response.setStatus(match.getStatus() != null ? match.getStatus().name() : null);
        response.setRemarks(match.getRemarks());
        
        if (match.getPreviousMatchOne() != null) {
            response.setPreviousMatchOneId(match.getPreviousMatchOne().getId());
        }
        if (match.getPreviousMatchTwo() != null) {
            response.setPreviousMatchTwoId(match.getPreviousMatchTwo().getId());
        }
        if (match.getNextMatch() != null) {
            response.setNextMatchId(match.getNextMatch().getId());
        }

        return response;
    }
}
