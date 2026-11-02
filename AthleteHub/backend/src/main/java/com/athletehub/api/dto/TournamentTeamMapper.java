package com.athletehub.api.dto;

import com.athletehub.api.entity.Team;
import com.athletehub.api.entity.TeamMember;
import com.athletehub.api.entity.TournamentTeam;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

public class TournamentTeamMapper {

    public static TournamentTeamResponse toResponse(TournamentTeam tt, List<TeamMember> activeMembers) {
        if (tt == null) return null;

        TournamentTeamResponse resp = new TournamentTeamResponse();
        resp.setId(tt.getId());
        if (tt.getTournament() != null) {
            resp.setTournamentId(tt.getTournament().getId());
            resp.setTournamentName(tt.getTournament().getName());
        }

        Team team = tt.getTeam();
        if (team != null) {
            resp.setTeamId(team.getId());
            resp.setTeamName(team.getName());
            resp.setTeamCode(team.getTeamCode());
            resp.setGender(team.getGender());
            resp.setAgeGroup(team.getAgeGroup());

            if (team.getSport() != null) {
                resp.setSportName(team.getSport().getName());
            }

            if (team.getCoach() != null) {
                resp.setCoachId(team.getCoach().getId());
                resp.setCoachName(team.getCoach().getFirstName() + " " + team.getCoach().getLastName());
            }
        }

        resp.setRegistrationDate(tt.getRegistrationDate());
        resp.setStatus(tt.getStatus());
        resp.setNotes(tt.getNotes());

        if (activeMembers != null) {
            resp.setMemberCount(activeMembers.size());
            resp.setMembers(activeMembers.stream().map(m -> {
                TournamentTeamMemberDto dto = new TournamentTeamMemberDto();
                if (m.getAthlete() != null) {
                    dto.setAthleteId(m.getAthlete().getId());
                    dto.setAthleteName(m.getAthlete().getFirstName() + " " + m.getAthlete().getLastName());
                    dto.setAthleteCode(m.getAthlete().getAthleteCode());
                    dto.setGender(m.getAthlete().getGender());
                    if (m.getAthlete().getDateOfBirth() != null) {
                        dto.setAge(Period.between(m.getAthlete().getDateOfBirth(), LocalDate.now()).getYears());
                    }
                }
                dto.setRole(m.getRole());
                dto.setPosition(m.getPosition());
                dto.setJerseyNumber(m.getJerseyNumber());
                dto.setStatus(m.getStatus());
                return dto;
            }).collect(Collectors.toList()));
        }

        return resp;
    }
}
