package com.athletehub.api.service;

import com.athletehub.api.dto.TournamentTeamMapper;
import com.athletehub.api.dto.TournamentTeamRequest;
import com.athletehub.api.dto.TournamentTeamResponse;
import com.athletehub.api.entity.*;
import com.athletehub.api.entity.enums.TournamentStatus;
import com.athletehub.api.repository.*;
import com.athletehub.api.util.EligibilityValidator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TournamentTeamService {

    private final TournamentTeamRepository tournamentTeamRepository;
    private final TournamentRepository tournamentRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final CoachRepository coachRepository;
    private final AthleteRepository athleteRepository;

    public TournamentTeamService(TournamentTeamRepository tournamentTeamRepository,
                                 TournamentRepository tournamentRepository,
                                 TeamRepository teamRepository,
                                 TeamMemberRepository teamMemberRepository,
                                 UserRepository userRepository,
                                 CoachRepository coachRepository,
                                 AthleteRepository athleteRepository) {
        this.tournamentTeamRepository = tournamentTeamRepository;
        this.tournamentRepository = tournamentRepository;
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.userRepository = userRepository;
        this.coachRepository = coachRepository;
        this.athleteRepository = athleteRepository;
    }

    @Transactional
    public TournamentTeamResponse addTeamToTournament(Integer tournamentId, TournamentTeamRequest request, Integer currentUserId) throws Exception {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new Exception("Tournament not found with ID: " + tournamentId));

        if (tournament.getStatus() == TournamentStatus.COMPLETED || tournament.getStatus() == TournamentStatus.CANCELLED) {
            throw new Exception("Cannot add teams. This tournament is already " + tournament.getStatus());
        }

        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new Exception("Team not found with ID: " + request.getTeamId()));

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new Exception("User not found"));

        // Authorization check
        String roleName = currentUser.getRole().getName();
        if ("ROLE_COACH".equals(roleName)) {
            Coach currentCoach = coachRepository.findByUserId(currentUserId);
            if (currentCoach == null || team.getCoach() == null || !team.getCoach().getId().equals(currentCoach.getId())) {
                throw new Exception("Access Denied: You can only register teams that you coach.");
            }
        } else if ("ROLE_ORG_ADMIN".equals(roleName)) {
            if (currentUser.getOrganization() != null && !currentUser.getOrganization().getId().equals(team.getOrganization().getId())) {
                throw new Exception("Access Denied: Team belongs to a different organization.");
            }
        }

        // Validate tournament organization matches team organization
        if (tournament.getEvent() != null && tournament.getEvent().getOrganization() != null) {
            if (!tournament.getEvent().getOrganization().getId().equals(team.getOrganization().getId())) {
                throw new Exception("Team must belong to the tournament host organization.");
            }
        }

        // Validate Sport compatibility
        if (tournament.getSport() != null && team.getSport() != null) {
            if (!tournament.getSport().getId().equals(team.getSport().getId())) {
                throw new Exception(String.format("Sport mismatch: Team '%s' is for %s, but tournament is for %s.",
                        team.getName(), team.getSport().getName(), tournament.getSport().getName()));
            }
        }

        // Validate Gender compatibility
        if (tournament.getGenderCategory() != null && team.getGender() != null) {
            String tGender = tournament.getGenderCategory().trim().toUpperCase();
            String teamGender = team.getGender().trim().toUpperCase();

            if (EligibilityValidator.isMale(tGender) && EligibilityValidator.isFemale(teamGender)) {
                throw new Exception(String.format("Gender mismatch: Female team '%s' cannot join Male tournament division (%s).",
                        team.getName(), tGender));
            }
            if (EligibilityValidator.isFemale(tGender) && EligibilityValidator.isMale(teamGender)) {
                throw new Exception(String.format("Gender mismatch: Male team '%s' cannot join Female tournament division (%s).",
                        team.getName(), tGender));
            }
        }

        // Validate Age compatibility
        if (tournament.getAgeCategory() != null && team.getAgeGroup() != null) {
            Integer tournMaxAge = EligibilityValidator.getMaxAgeLimit(tournament.getAgeCategory());
            Integer teamMaxAge = EligibilityValidator.getMaxAgeLimit(team.getAgeGroup());

            if (tournMaxAge != null && teamMaxAge != null && teamMaxAge > tournMaxAge) {
                throw new Exception(String.format("Age limit exceeded: Team '%s' (%s) exceeds tournament age category (%s).",
                        team.getName(), team.getAgeGroup(), tournament.getAgeCategory()));
            }
        }

        // Check if already registered
        if (tournamentTeamRepository.existsByTournamentIdAndTeamIdAndIsDeletedFalse(tournamentId, team.getId())) {
            throw new Exception("Team '" + team.getName() + "' is already registered in this tournament.");
        }

        // Check if there was a previously deleted entry to reactivate
        Optional<TournamentTeam> existingDeleted = tournamentTeamRepository.findByTournamentIdAndTeamIdAndIsDeletedFalse(tournamentId, team.getId());
        TournamentTeam tt;
        if (existingDeleted.isPresent()) {
            tt = existingDeleted.get();
            tt.setIsDeleted(false);
            tt.setStatus("APPROVED");
            tt.setNotes(request.getNotes());
            tt.setUpdatedBy(currentUserId);
        } else {
            tt = new TournamentTeam();
            tt.setTournament(tournament);
            tt.setTeam(team);
            tt.setRegisteredBy(currentUser);
            tt.setRegistrationDate(LocalDateTime.now());
            tt.setStatus("APPROVED");
            tt.setNotes(request.getNotes() != null && !request.getNotes().trim().isEmpty()
                    ? request.getNotes().trim() : "Team registered by Coach for tournament");
            tt.setCreatedBy(currentUserId);
            tt.setUpdatedBy(currentUserId);
        }

        tt = tournamentTeamRepository.save(tt);
        List<TeamMember> activeMembers = teamMemberRepository.findByTeamIdAndStatus(team.getId(), "ACTIVE");
        return TournamentTeamMapper.toResponse(tt, activeMembers);
    }

    public List<TournamentTeamResponse> getTournamentTeams(Integer tournamentId) {
        List<TournamentTeam> teams = tournamentTeamRepository.findByTournamentIdWithTeamDetails(tournamentId);
        return teams.stream().map(tt -> {
            List<TeamMember> activeMembers = teamMemberRepository.findByTeamIdAndStatus(tt.getTeam().getId(), "ACTIVE");
            return TournamentTeamMapper.toResponse(tt, activeMembers);
        }).collect(Collectors.toList());
    }

    @Transactional
    public void removeTeamFromTournament(Integer tournamentId, Integer teamId, Integer currentUserId) throws Exception {
        TournamentTeam tt = tournamentTeamRepository.findByTournamentIdAndTeamIdAndIsDeletedFalse(tournamentId, teamId)
                .orElseThrow(() -> new Exception("Team registration not found in this tournament"));

        User currentUser = userRepository.findById(currentUserId).orElseThrow();
        String roleName = currentUser.getRole().getName();
        if ("ROLE_COACH".equals(roleName)) {
            Coach currentCoach = coachRepository.findByUserId(currentUserId);
            if (currentCoach == null || tt.getTeam().getCoach() == null || !tt.getTeam().getCoach().getId().equals(currentCoach.getId())) {
                throw new Exception("Access Denied: You can only remove teams that you coach.");
            }
        }

        tt.setIsDeleted(true);
        tt.setStatus("WITHDRAWN");
        tt.setUpdatedBy(currentUserId);
        tournamentTeamRepository.save(tt);
    }
}
