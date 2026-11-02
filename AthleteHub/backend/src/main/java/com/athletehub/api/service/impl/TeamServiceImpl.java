package com.athletehub.api.service.impl;

import com.athletehub.api.dto.TeamDTO;
import com.athletehub.api.dto.TeamMemberDTO;
import com.athletehub.api.dto.TeamMemberRequest;
import com.athletehub.api.dto.TeamRequest;
import com.athletehub.api.entity.*;
import com.athletehub.api.exception.ResourceNotFoundException;
import com.athletehub.api.repository.*;
import com.athletehub.api.service.TeamService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.*;
import java.util.stream.Collectors;
import com.athletehub.api.util.EligibilityValidator;

@Service
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final OrganizationRepository organizationRepository;
    private final CoachRepository coachRepository;
    private final AthleteRepository athleteRepository;
    private final SportRepository sportRepository;

    public TeamServiceImpl(TeamRepository teamRepository,
                           TeamMemberRepository teamMemberRepository,
                           OrganizationRepository organizationRepository,
                           CoachRepository coachRepository,
                           AthleteRepository athleteRepository,
                           SportRepository sportRepository) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.organizationRepository = organizationRepository;
        this.coachRepository = coachRepository;
        this.athleteRepository = athleteRepository;
        this.sportRepository = sportRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeamDTO> getTeams(Integer organizationId, Integer coachId, String status) {
        List<Team> teams = teamRepository.searchTeams(organizationId, coachId, status);
        return teams.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TeamDTO getTeamById(Integer id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with ID: " + id));
        TeamDTO dto = toDTO(team);
        List<TeamMember> allMembers = teamMemberRepository.findByTeamId(id);

        List<TeamMemberDTO> activeMembers = allMembers.stream()
                .filter(tm -> tm.getStatus() == null || "ACTIVE".equalsIgnoreCase(tm.getStatus()))
                .map(this::toMemberDTO)
                .collect(Collectors.toList());
        dto.setMembers(activeMembers);

        List<TeamMemberDTO> joinRequests = allMembers.stream()
                .filter(tm -> "PENDING".equalsIgnoreCase(tm.getStatus()))
                .map(this::toMemberDTO)
                .collect(Collectors.toList());
        dto.setJoinRequests(joinRequests);
        dto.setPendingRequestsCount(joinRequests.size());
        dto.setMemberCount(activeMembers.size());
        return dto;
    }

    @Override
    @Transactional
    public TeamDTO createTeam(TeamRequest request, Integer organizationId, Integer coachId) {
        return createTeam(request, organizationId, coachId, null);
    }

    @Override
    @Transactional
    public TeamDTO createTeam(TeamRequest request, Integer organizationId, Integer coachId, Integer createdByAthleteId) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Team name is required");
        }

        Integer effectiveOrgId = organizationId != null ? organizationId : request.getOrganizationId();
        Integer effectiveCoachId = coachId != null ? coachId : request.getCoachId();

        if (effectiveOrgId == null) {
            throw new IllegalArgumentException("Organization ID is required");
        }
        if (effectiveCoachId == null) {
            throw new IllegalArgumentException("Coach ID is required. Please select a coach to supervise and approve the team.");
        }

        Organization org = organizationRepository.findById(effectiveOrgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        Coach coach = coachRepository.findById(effectiveCoachId)
                .orElseThrow(() -> new ResourceNotFoundException("Coach not found"));

        String targetGender = request.getGender() != null ? request.getGender() : "COED";
        String targetAgeGroup = request.getAgeGroup() != null ? request.getAgeGroup() : "All Ages";

        // Validate creator athlete eligibility
        Athlete creatorAthlete = null;
        if (createdByAthleteId != null) {
            creatorAthlete = athleteRepository.findById(createdByAthleteId)
                    .orElseThrow(() -> new ResourceNotFoundException("Creator athlete not found"));

            List<TeamMember> activeMemberships = teamMemberRepository.findActiveMembershipsByAthleteId(createdByAthleteId);
            if (!activeMemberships.isEmpty()) {
                Team existingTeam = activeMemberships.get(0).getTeam();
                throw new IllegalArgumentException(String.format(
                    "You are already assigned to team '%s' (%s). An athlete cannot belong to more than one team.",
                    existingTeam.getName(), existingTeam.getTeamCode()
                ));
            }

            EligibilityValidator.validateGender(targetGender, creatorAthlete.getGender(),
                    creatorAthlete.getFirstName() + " " + creatorAthlete.getLastName(), "team");
            EligibilityValidator.validateAge(targetAgeGroup, creatorAthlete.getDateOfBirth(),
                    creatorAthlete.getFirstName() + " " + creatorAthlete.getLastName(), "team");
        }

        // Validate all requested member athletes before saving
        List<Athlete> validatedMembers = new ArrayList<>();
        if (request.getMemberAthleteIds() != null && !request.getMemberAthleteIds().isEmpty()) {
            for (Integer athleteId : request.getMemberAthleteIds()) {
                if (athleteId == null || athleteId.equals(createdByAthleteId)) continue;
                Athlete athlete = athleteRepository.findById(athleteId)
                        .orElseThrow(() -> new ResourceNotFoundException("Athlete not found with ID: " + athleteId));

                List<TeamMember> activeMemberships = teamMemberRepository.findActiveMembershipsByAthleteId(athleteId);
                if (!activeMemberships.isEmpty()) {
                    Team existingTeam = activeMemberships.get(0).getTeam();
                    throw new IllegalArgumentException(String.format(
                        "Athlete '%s %s' is already assigned to team '%s' (%s). A player cannot belong to more than one team.",
                        athlete.getFirstName(), athlete.getLastName(), existingTeam.getName(), existingTeam.getTeamCode()
                    ));
                }

                EligibilityValidator.validateGender(targetGender, athlete.getGender(),
                        athlete.getFirstName() + " " + athlete.getLastName(), "team");
                EligibilityValidator.validateAge(targetAgeGroup, athlete.getDateOfBirth(),
                        athlete.getFirstName() + " " + athlete.getLastName(), "team");

                validatedMembers.add(athlete);
            }
        }

        Team team = new Team();
        team.setName(request.getName().trim());
        team.setDescription(request.getDescription());
        team.setGender(targetGender);
        team.setAgeGroup(targetAgeGroup);

        if (createdByAthleteId != null) {
            team.setStatus("PENDING_APPROVAL");
            team.setCreatedByAthleteId(createdByAthleteId);
        } else {
            team.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");
        }

        team.setOrganization(org);
        team.setCoach(coach);

        if (request.getSportId() != null) {
            Sport sport = sportRepository.findById(request.getSportId()).orElse(null);
            team.setSport(sport);
        }

        Team saved = teamRepository.save(team);
        saved.setTeamCode("TEAM" + String.format("%05d", saved.getId()));
        saved = teamRepository.save(saved);

        final Team finalTeam = saved;

        // If created by athlete, automatically add the creator athlete as Captain
        if (creatorAthlete != null) {
            TeamMember captain = new TeamMember();
            captain.setTeam(finalTeam);
            captain.setAthlete(creatorAthlete);
            captain.setRole("Captain");
            captain.setStatus("ACTIVE");
            captain.setJoinedAt(LocalDateTime.now());
            teamMemberRepository.save(captain);
        }

        // Add validated member athletes
        for (Athlete memberAthlete : validatedMembers) {
            TeamMember member = new TeamMember();
            member.setTeam(finalTeam);
            member.setAthlete(memberAthlete);
            member.setRole("Player");
            member.setStatus("ACTIVE");
            member.setJoinedAt(LocalDateTime.now());
            teamMemberRepository.save(member);
        }

        return toDTO(saved);
    }

    @Override
    @Transactional
    public TeamDTO approveTeam(Integer id, Integer reviewerUserId) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with ID: " + id));
        team.setStatus("ACTIVE");
        team.setRejectionReason(null);
        return toDTO(teamRepository.save(team));
    }

    @Override
    @Transactional
    public TeamDTO rejectTeam(Integer id, String reason, Integer reviewerUserId) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with ID: " + id));
        team.setStatus("REJECTED");
        team.setRejectionReason(reason != null && !reason.isBlank() ? reason.trim() : "Rejected by coach or administrator.");
        return toDTO(teamRepository.save(team));
    }

    @Override
    @Transactional
    public TeamDTO updateTeam(Integer id, TeamRequest request) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with ID: " + id));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            team.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            team.setDescription(request.getDescription());
        }
        if (request.getGender() != null) {
            team.setGender(request.getGender());
        }
        if (request.getAgeGroup() != null) {
            team.setAgeGroup(request.getAgeGroup());
        }
        if (request.getStatus() != null) {
            team.setStatus(request.getStatus());
        }
        if (request.getSportId() != null) {
            Sport sport = sportRepository.findById(request.getSportId()).orElse(null);
            team.setSport(sport);
        }

        return toDTO(teamRepository.save(team));
    }

    @Override
    @Transactional
    public void deleteTeam(Integer id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with ID: " + id));
        teamRepository.delete(team);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeamMemberDTO> getTeamMembers(Integer teamId) {
        return teamMemberRepository.findByTeamId(teamId).stream()
                .map(this::toMemberDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TeamMemberDTO addMember(Integer teamId, TeamMemberRequest request) {
        if (request.getAthleteId() == null) {
            throw new IllegalArgumentException("Athlete ID is required");
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with ID: " + teamId));

        if (teamMemberRepository.existsByTeamIdAndAthleteId(teamId, request.getAthleteId())) {
            throw new IllegalArgumentException("Athlete is already a member of this team");
        }

        Athlete athlete = athleteRepository.findById(request.getAthleteId())
                .orElseThrow(() -> new ResourceNotFoundException("Athlete not found with ID: " + request.getAthleteId()));

        List<TeamMember> activeMemberships = teamMemberRepository.findActiveMembershipsByAthleteId(request.getAthleteId());
        for (TeamMember m : activeMemberships) {
            if (!m.getTeam().getId().equals(teamId)) {
                throw new IllegalArgumentException(String.format(
                    "Athlete '%s %s' is already assigned to team '%s' (%s). A player cannot belong to more than one team.",
                    athlete.getFirstName(), athlete.getLastName(), m.getTeam().getName(), m.getTeam().getTeamCode()
                ));
            }
        }

        EligibilityValidator.validateGender(team.getGender(), athlete.getGender(),
                athlete.getFirstName() + " " + athlete.getLastName(), "team");
        EligibilityValidator.validateAge(team.getAgeGroup(), athlete.getDateOfBirth(),
                athlete.getFirstName() + " " + athlete.getLastName(), "team");

        TeamMember member = new TeamMember();
        member.setTeam(team);
        member.setAthlete(athlete);
        member.setRole(request.getRole() != null && !request.getRole().trim().isEmpty() ? request.getRole() : "Player");
        member.setPosition(request.getPosition());
        member.setJerseyNumber(request.getJerseyNumber());
        member.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");
        member.setJoinedAt(LocalDateTime.now());

        TeamMember saved = teamMemberRepository.save(member);
        return toMemberDTO(saved);
    }

    @Override
    @Transactional
    public List<TeamMemberDTO> addMembersBatch(Integer teamId, List<Integer> athleteIds, String defaultRole) {
        if (athleteIds == null || athleteIds.isEmpty()) {
            return Collections.emptyList();
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with ID: " + teamId));

        String role = (defaultRole != null && !defaultRole.trim().isEmpty()) ? defaultRole : "Player";
        List<TeamMemberDTO> results = new ArrayList<>();

        for (Integer athleteId : athleteIds) {
            if (athleteId != null && !teamMemberRepository.existsByTeamIdAndAthleteId(teamId, athleteId)) {
                Athlete athlete = athleteRepository.findById(athleteId).orElse(null);
                if (athlete != null) {
                    List<TeamMember> activeMemberships = teamMemberRepository.findActiveMembershipsByAthleteId(athleteId);
                    for (TeamMember m : activeMemberships) {
                        if (!m.getTeam().getId().equals(teamId)) {
                            throw new IllegalArgumentException(String.format(
                                "Athlete '%s %s' is already assigned to team '%s' (%s). A player cannot belong to more than one team.",
                                athlete.getFirstName(), athlete.getLastName(), m.getTeam().getName(), m.getTeam().getTeamCode()
                            ));
                        }
                    }

                    EligibilityValidator.validateGender(team.getGender(), athlete.getGender(),
                            athlete.getFirstName() + " " + athlete.getLastName(), "team");
                    EligibilityValidator.validateAge(team.getAgeGroup(), athlete.getDateOfBirth(),
                            athlete.getFirstName() + " " + athlete.getLastName(), "team");

                    TeamMember member = new TeamMember();
                    member.setTeam(team);
                    member.setAthlete(athlete);
                    member.setRole(role);
                    member.setStatus("ACTIVE");
                    member.setJoinedAt(LocalDateTime.now());
                    results.add(toMemberDTO(teamMemberRepository.save(member)));
                }
            }
        }
        return results;
    }

    @Override
    @Transactional
    public TeamMemberDTO updateMember(Integer teamId, Integer athleteId, TeamMemberRequest request) {
        TeamMember member = teamMemberRepository.findByTeamIdAndAthleteId(teamId, athleteId)
                .orElseThrow(() -> new ResourceNotFoundException("Athlete is not in this team"));

        if (request.getRole() != null) {
            member.setRole(request.getRole());
        }
        if (request.getPosition() != null) {
            member.setPosition(request.getPosition());
        }
        if (request.getJerseyNumber() != null) {
            member.setJerseyNumber(request.getJerseyNumber());
        }
        if (request.getStatus() != null) {
            member.setStatus(request.getStatus());
        }

        return toMemberDTO(teamMemberRepository.save(member));
    }

    @Override
    @Transactional
    public void removeMember(Integer teamId, Integer athleteId) {
        TeamMember member = teamMemberRepository.findByTeamIdAndAthleteId(teamId, athleteId)
                .orElseThrow(() -> new ResourceNotFoundException("Athlete is not in this team"));
        teamMemberRepository.delete(member);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAvailableAthletes(Integer teamId, Integer organizationId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with ID: " + teamId));

        Integer orgId = organizationId != null ? organizationId : team.getOrganization().getId();

        // Get currently assigned athlete IDs in this team
        Set<Integer> existingAthleteIds = teamMemberRepository.findByTeamId(teamId).stream()
                .map(tm -> tm.getAthlete().getId())
                .collect(Collectors.toSet());

        // Map of athlete ID to their other assigned team names
        Map<Integer, String> activeAthleteTeamMap = new HashMap<>();
        for (TeamMember tm : teamMemberRepository.findAllActiveMemberships()) {
            if (tm.getAthlete() != null && tm.getTeam() != null) {
                activeAthleteTeamMap.put(tm.getAthlete().getId(), tm.getTeam().getName());
            }
        }

        // Get active athletes in this organization
        List<Athlete> allOrgAthletes = athleteRepository.findByOrganizationIdAndStatusNot(orgId, "Deleted");

        List<Map<String, Object>> available = new ArrayList<>();
        for (Athlete a : allOrgAthletes) {
            if (existingAthleteIds.contains(a.getId())) {
                continue;
            }

            String otherAssignedTeam = activeAthleteTeamMap.get(a.getId());
            boolean isAssignedToOther = otherAssignedTeam != null;
            boolean genderEligible = EligibilityValidator.isGenderEligible(team.getGender(), a.getGender());
            boolean ageEligible = EligibilityValidator.isAgeEligible(team.getAgeGroup(), a.getDateOfBirth());

            int age = a.getDateOfBirth() != null ? Period.between(a.getDateOfBirth(), LocalDate.now()).getYears() : 0;

            String ineligibilityReason = null;
            if (isAssignedToOther) {
                ineligibilityReason = "Already assigned to team: " + otherAssignedTeam;
            } else if (!genderEligible) {
                ineligibilityReason = "Gender mismatch (" + a.getGender() + " vs " + team.getGender() + " team)";
            } else if (!ageEligible) {
                ineligibilityReason = "Age mismatch (" + age + " yrs old for " + team.getAgeGroup() + ")";
            }

            Map<String, Object> item = new HashMap<>();
            item.put("id", a.getId());
            item.put("fullName", (a.getFirstName() + " " + a.getLastName()).trim());
            item.put("athleteCode", a.getAthleteCode());
            item.put("sportName", a.getSport() != null ? a.getSport().getName() : "N/A");
            item.put("gender", a.getGender());
            item.put("dateOfBirth", a.getDateOfBirth());
            item.put("age", age);
            item.put("competitionRole", a.getCompetitionRole());
            item.put("profilePhotoUrl", a.getProfilePhotoUrl());
            item.put("assignedTeamName", otherAssignedTeam);
            item.put("isEligible", ineligibilityReason == null);
            item.put("ineligibilityReason", ineligibilityReason);
            available.add(item);
        }
        return available;
    }

    private TeamDTO toDTO(Team team) {
        TeamDTO dto = new TeamDTO();
        dto.setId(team.getId());
        dto.setTeamCode(team.getTeamCode());
        dto.setName(team.getName());
        dto.setDescription(team.getDescription());
        dto.setGender(team.getGender());
        dto.setAgeGroup(team.getAgeGroup());
        dto.setStatus(team.getStatus());

        if (team.getOrganization() != null) {
            dto.setOrganizationId(team.getOrganization().getId());
            dto.setOrganizationName(team.getOrganization().getName());
        }

        if (team.getCoach() != null) {
            dto.setCoachId(team.getCoach().getId());
            dto.setCoachName(team.getCoach().getFirstName() + " " + team.getCoach().getLastName());
        }

        if (team.getSport() != null) {
            dto.setSportId(team.getSport().getId());
            dto.setSportName(team.getSport().getName());
        }

        dto.setCreatedByAthleteId(team.getCreatedByAthleteId());
        dto.setRejectionReason(team.getRejectionReason());
        if (team.getCreatedByAthleteId() != null) {
            athleteRepository.findById(team.getCreatedByAthleteId()).ifPresent(a -> {
                dto.setCreatedByAthleteName((a.getFirstName() + " " + a.getLastName()).trim());
            });
        }

        dto.setMemberCount((int) teamMemberRepository.countByTeamIdAndStatus(team.getId(), "ACTIVE"));
        dto.setPendingRequestsCount((int) teamMemberRepository.countByTeamIdAndStatus(team.getId(), "PENDING"));
        dto.setCreatedAt(team.getCreatedAt());
        dto.setUpdatedAt(team.getUpdatedAt());
        return dto;
    }

    @Override
    @Transactional
    public TeamMemberDTO requestToJoinTeam(Integer teamId, Integer athleteId, TeamMemberRequest request) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with ID: " + teamId));

        if (!"ACTIVE".equalsIgnoreCase(team.getStatus())) {
            throw new IllegalArgumentException("Cannot request to join: Team is not currently active.");
        }

        Athlete athlete = athleteRepository.findById(athleteId)
                .orElseThrow(() -> new ResourceNotFoundException("Athlete not found with ID: " + athleteId));

        // 1. Organization verification
        if (athlete.getOrganizationId() == null || !athlete.getOrganizationId().equals(team.getOrganization().getId())) {
            throw new IllegalArgumentException("You can only request to join teams within your registered organization.");
        }

        // 2. Single-team assignment rule: Cannot be an active member of ANY team
        List<TeamMember> activeMemberships = teamMemberRepository.findActiveMembershipsByAthleteId(athleteId);
        if (!activeMemberships.isEmpty()) {
            Team existingTeam = activeMemberships.get(0).getTeam();
            if (existingTeam.getId().equals(teamId)) {
                throw new IllegalArgumentException("You are already an active member of this team.");
            } else {
                throw new IllegalArgumentException(String.format(
                    "You are already assigned to team '%s' (%s). An athlete cannot belong to more than one team.",
                    existingTeam.getName(), existingTeam.getTeamCode()
                ));
            }
        }

        // 3. Gender and Age eligibility check
        EligibilityValidator.validateGender(team.getGender(), athlete.getGender(),
                athlete.getFirstName() + " " + athlete.getLastName(), "team");
        EligibilityValidator.validateAge(team.getAgeGroup(), athlete.getDateOfBirth(),
                athlete.getFirstName() + " " + athlete.getLastName(), "team");

        // 4. Check if request or record already exists in team
        Optional<TeamMember> existingRecord = teamMemberRepository.findByTeamIdAndAthleteId(teamId, athleteId);
        TeamMember member;
        if (existingRecord.isPresent()) {
            member = existingRecord.get();
            if ("PENDING".equalsIgnoreCase(member.getStatus())) {
                throw new IllegalArgumentException("You already have a pending join request for this team. Please wait for the coach to review.");
            }
            if ("ACTIVE".equalsIgnoreCase(member.getStatus())) {
                throw new IllegalArgumentException("You are already an active member of this team.");
            }
            // If it was REJECTED previously, allow re-requesting
            member.setStatus("PENDING");
            member.setJoinedAt(LocalDateTime.now());
        } else {
            member = new TeamMember();
            member.setTeam(team);
            member.setAthlete(athlete);
            member.setStatus("PENDING");
            member.setJoinedAt(LocalDateTime.now());
        }

        member.setRole("Player");
        if (request != null) {
            if (request.getPosition() != null && !request.getPosition().isBlank()) {
                member.setPosition(request.getPosition().trim());
            }
            if (request.getJerseyNumber() != null) {
                member.setJerseyNumber(request.getJerseyNumber());
            }
            if (request.getNotes() != null && !request.getNotes().isBlank()) {
                member.setRequestNotes(request.getNotes().trim());
            }
        }

        TeamMember saved = teamMemberRepository.save(member);
        return toMemberDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeamMemberDTO> getJoinRequests(Integer teamId) {
        return teamMemberRepository.findByTeamIdAndStatus(teamId, "PENDING").stream()
                .map(this::toMemberDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TeamMemberDTO approveJoinRequest(Integer teamId, Integer athleteId, Integer reviewerUserId) {
        TeamMember member = teamMemberRepository.findByTeamIdAndAthleteId(teamId, athleteId)
                .orElseThrow(() -> new ResourceNotFoundException("Join request not found for this athlete"));

        if (!"PENDING".equalsIgnoreCase(member.getStatus())) {
            throw new IllegalArgumentException("This join request is not in PENDING status (current: " + member.getStatus() + ").");
        }

        // Re-verify single-team assignment in case athlete joined another team in the meantime
        List<TeamMember> otherActive = teamMemberRepository.findActiveMembershipsByAthleteId(athleteId);
        for (TeamMember m : otherActive) {
            if (!m.getTeam().getId().equals(teamId)) {
                throw new IllegalArgumentException(String.format(
                    "Cannot approve: Athlete '%s %s' is already active in another team '%s' (%s).",
                    member.getAthlete().getFirstName(), member.getAthlete().getLastName(),
                    m.getTeam().getName(), m.getTeam().getTeamCode()
                ));
            }
        }

        member.setStatus("ACTIVE");
        member.setJoinedAt(LocalDateTime.now());
        TeamMember saved = teamMemberRepository.save(member);
        return toMemberDTO(saved);
    }

    @Override
    @Transactional
    public TeamMemberDTO rejectJoinRequest(Integer teamId, Integer athleteId, String reason, Integer reviewerUserId) {
        TeamMember member = teamMemberRepository.findByTeamIdAndAthleteId(teamId, athleteId)
                .orElseThrow(() -> new ResourceNotFoundException("Join request not found for this athlete"));

        member.setStatus("REJECTED");
        if (reason != null && !reason.isBlank()) {
            member.setRequestNotes("Rejected: " + reason.trim());
        }
        TeamMember saved = teamMemberRepository.save(member);
        return toMemberDTO(saved);
    }

    @Override
    @Transactional
    public void cancelJoinRequest(Integer teamId, Integer athleteId) {
        TeamMember member = teamMemberRepository.findByTeamIdAndAthleteId(teamId, athleteId)
                .orElseThrow(() -> new ResourceNotFoundException("Join request not found"));

        if (!"PENDING".equalsIgnoreCase(member.getStatus())) {
            throw new IllegalArgumentException("Only pending join requests can be cancelled.");
        }
        teamMemberRepository.delete(member);
    }

    private TeamMemberDTO toMemberDTO(TeamMember member) {
        TeamMemberDTO dto = new TeamMemberDTO();
        dto.setId(member.getId());
        dto.setTeamId(member.getTeam().getId());
        dto.setRole(member.getRole());
        dto.setPosition(member.getPosition());
        dto.setJerseyNumber(member.getJerseyNumber());
        dto.setStatus(member.getStatus());
        dto.setRequestNotes(member.getRequestNotes());
        dto.setJoinedAt(member.getJoinedAt());

        if (member.getAthlete() != null) {
            Athlete a = member.getAthlete();
            dto.setAthleteId(a.getId());
            dto.setAthleteName((a.getFirstName() + " " + a.getLastName()).trim());
            dto.setAthleteCode(a.getAthleteCode());
            dto.setPhotoUrl(a.getProfilePhotoUrl());
            dto.setGender(a.getGender());
            if (a.getDateOfBirth() != null) {
                dto.setAge(Period.between(a.getDateOfBirth(), LocalDate.now()).getYears());
            }
            dto.setPerformanceRating(a.getPerformanceRating());
            if (a.getSport() != null) {
                dto.setSportName(a.getSport().getName());
            }
        }
        return dto;
    }
}
