package com.athletehub.api.service;

import com.athletehub.api.dto.TeamDTO;
import com.athletehub.api.dto.TeamMemberDTO;
import com.athletehub.api.dto.TeamMemberRequest;
import com.athletehub.api.dto.TeamRequest;

import java.util.List;
import java.util.Map;

public interface TeamService {
    List<TeamDTO> getTeams(Integer organizationId, Integer coachId, String status);
    TeamDTO getTeamById(Integer id);
    TeamDTO createTeam(TeamRequest request, Integer organizationId, Integer coachId);
    TeamDTO createTeam(TeamRequest request, Integer organizationId, Integer coachId, Integer createdByAthleteId);
    TeamDTO approveTeam(Integer id, Integer reviewerUserId);
    TeamDTO rejectTeam(Integer id, String reason, Integer reviewerUserId);
    TeamDTO updateTeam(Integer id, TeamRequest request);
    void deleteTeam(Integer id);

    List<TeamMemberDTO> getTeamMembers(Integer teamId);
    TeamMemberDTO addMember(Integer teamId, TeamMemberRequest request);
    List<TeamMemberDTO> addMembersBatch(Integer teamId, List<Integer> athleteIds, String defaultRole);
    TeamMemberDTO updateMember(Integer teamId, Integer athleteId, TeamMemberRequest request);
    void removeMember(Integer teamId, Integer athleteId);

    List<Map<String, Object>> getAvailableAthletes(Integer teamId, Integer organizationId);

    TeamMemberDTO requestToJoinTeam(Integer teamId, Integer athleteId, TeamMemberRequest request);
    List<TeamMemberDTO> getJoinRequests(Integer teamId);
    TeamMemberDTO approveJoinRequest(Integer teamId, Integer athleteId, Integer reviewerUserId);
    TeamMemberDTO rejectJoinRequest(Integer teamId, Integer athleteId, String reason, Integer reviewerUserId);
    void cancelJoinRequest(Integer teamId, Integer athleteId);
}
