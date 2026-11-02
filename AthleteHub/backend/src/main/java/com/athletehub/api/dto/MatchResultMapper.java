package com.athletehub.api.dto;

import com.athletehub.api.entity.MatchResult;

public class MatchResultMapper {

    public static MatchResultResponse toResponse(MatchResult result) {
        if (result == null) {
            return null;
        }

        MatchResultResponse response = new MatchResultResponse();
        response.setId(result.getId());
        response.setResultCode(result.getResultCode());
        
        if (result.getMatch() != null) {
            response.setMatchId(result.getMatch().getId());
        }
        
        if (result.getAthlete() != null) {
            response.setAthleteId(result.getAthlete().getId());
            response.setAthleteName(result.getAthlete().getFirstName() + " " + result.getAthlete().getLastName());
        }
        
        response.setRank(result.getRank());
        response.setScore(result.getScore());
        response.setMedal(result.getMedal() != null ? result.getMedal().name() : null);
        response.setRemarks(result.getRemarks());

        return response;
    }
}
