package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.dto.TeamDTO;
import com.athletehub.api.dto.TeamMemberDTO;
import com.athletehub.api.dto.TeamMemberRequest;
import com.athletehub.api.dto.TeamRequest;
import com.athletehub.api.entity.Coach;
import com.athletehub.api.security.TenantSecurityService;
import com.athletehub.api.service.TeamService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/teams")
public class TeamController {

    private final TeamService teamService;
    private final TenantSecurityService tenantSecurityService;

    public TeamController(TeamService teamService, TenantSecurityService tenantSecurityService) {
        this.teamService = teamService;
        this.tenantSecurityService = tenantSecurityService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('COACH', 'ORG_ADMIN', 'SUPER_ADMIN', 'ATHLETE')")
    public ResponseEntity<ApiResponse<List<TeamDTO>>> getTeams(
            @RequestParam(required = false) Integer organizationId,
            @RequestParam(required = false) Integer coachId,
            @RequestParam(required = false) String status) {

        Integer effectiveOrgId = organizationId;
        Integer effectiveCoachId = coachId;

        if (!tenantSecurityService.isSuperAdmin()) {
            effectiveOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (tenantSecurityService.isCoach()) {
                Coach coach = tenantSecurityService.getCurrentCoach();
                if (coach != null) {
                    effectiveCoachId = coach.getId();
                }
            }
        }

        List<TeamDTO> teams = teamService.getTeams(effectiveOrgId, effectiveCoachId, status);
        return ResponseEntity.ok(ApiResponse.success("Teams retrieved successfully", teams));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('COACH', 'ORG_ADMIN', 'SUPER_ADMIN', 'ATHLETE')")
    public ResponseEntity<ApiResponse<?>> getTeamById(@PathVariable Integer id) {
        TeamDTO team = teamService.getTeamById(id);
        if (!tenantSecurityService.isSuperAdmin()) {
            Integer userOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (userOrgId != null && !userOrgId.equals(team.getOrganizationId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied. Team belongs to another organization."));
            }
        }
        return ResponseEntity.ok(ApiResponse.success("Team retrieved successfully", team));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('COACH', 'ORG_ADMIN', 'SUPER_ADMIN', 'ATHLETE')")
    public ResponseEntity<ApiResponse<?>> createTeam(@RequestBody TeamRequest request) {
        Integer orgId = request.getOrganizationId();
        Integer coachId = request.getCoachId();
        Integer createdByAthleteId = null;

        if (!tenantSecurityService.isSuperAdmin()) {
            orgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (orgId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Your account is not linked to an organization."));
            }

            if (tenantSecurityService.isCoach()) {
                Coach coach = tenantSecurityService.getCurrentCoach();
                if (coach == null) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(ApiResponse.error("Coach profile not found for this account."));
                }
                coachId = coach.getId();
            } else if (tenantSecurityService.isAthlete()) {
                com.athletehub.api.entity.Athlete currentAthlete = tenantSecurityService.getCurrentAthlete();
                if (currentAthlete == null) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(ApiResponse.error("Athlete profile not found. Please complete your profile first."));
                }
                createdByAthleteId = currentAthlete.getId();
                if (coachId == null) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(ApiResponse.error("Please select a coach from your organization to review and approve your team squad."));
                }
            }
        }

        TeamDTO created = teamService.createTeam(request, orgId, coachId, createdByAthleteId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdByAthleteId != null
                        ? "Team squad created! Request submitted to coach for review and approval."
                        : "Team created successfully", created));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<?>> approveTeam(@PathVariable Integer id) {
        TeamDTO existing = teamService.getTeamById(id);
        if (!tenantSecurityService.isSuperAdmin()) {
            Integer userOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (userOrgId != null && !userOrgId.equals(existing.getOrganizationId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied."));
            }
            if (tenantSecurityService.isCoach()) {
                Coach coach = tenantSecurityService.getCurrentCoach();
                if (coach != null && existing.getCoachId() != null && !coach.getId().equals(existing.getCoachId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(ApiResponse.error("Only the assigned coach or organization administrator can approve this team squad."));
                }
            }
        }

        Integer reviewerId = tenantSecurityService.getCurrentUser() != null ? tenantSecurityService.getCurrentUser().getId() : null;
        TeamDTO approved = teamService.approveTeam(id, reviewerId);
        return ResponseEntity.ok(ApiResponse.success("Team squad approved successfully! Team is now active.", approved));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<?>> rejectTeam(@PathVariable Integer id, @RequestBody(required = false) Map<String, String> body) {
        TeamDTO existing = teamService.getTeamById(id);
        if (!tenantSecurityService.isSuperAdmin()) {
            Integer userOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (userOrgId != null && !userOrgId.equals(existing.getOrganizationId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied."));
            }
            if (tenantSecurityService.isCoach()) {
                Coach coach = tenantSecurityService.getCurrentCoach();
                if (coach != null && existing.getCoachId() != null && !coach.getId().equals(existing.getCoachId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(ApiResponse.error("Only the assigned coach or organization administrator can review this team squad."));
                }
            }
        }

        String reason = body != null ? body.get("reason") : null;
        Integer reviewerId = tenantSecurityService.getCurrentUser() != null ? tenantSecurityService.getCurrentUser().getId() : null;
        TeamDTO rejected = teamService.rejectTeam(id, reason, reviewerId);
        return ResponseEntity.ok(ApiResponse.success("Team squad rejected.", rejected));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<?>> updateTeam(@PathVariable Integer id, @RequestBody TeamRequest request) {
        TeamDTO existing = teamService.getTeamById(id);
        if (!tenantSecurityService.isSuperAdmin()) {
            Integer userOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (userOrgId != null && !userOrgId.equals(existing.getOrganizationId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied."));
            }
        }

        TeamDTO updated = teamService.updateTeam(id, request);
        return ResponseEntity.ok(ApiResponse.success("Team updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<?>> deleteTeam(@PathVariable Integer id) {
        TeamDTO existing = teamService.getTeamById(id);
        if (!tenantSecurityService.isSuperAdmin()) {
            Integer userOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (userOrgId != null && !userOrgId.equals(existing.getOrganizationId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied."));
            }
        }

        teamService.deleteTeam(id);
        return ResponseEntity.ok(ApiResponse.success("Team deleted successfully", null));
    }

    @GetMapping("/{id}/members")
    @PreAuthorize("hasAnyRole('COACH', 'ORG_ADMIN', 'SUPER_ADMIN', 'ATHLETE')")
    public ResponseEntity<ApiResponse<List<TeamMemberDTO>>> getTeamMembers(@PathVariable Integer id) {
        List<TeamMemberDTO> members = teamService.getTeamMembers(id);
        return ResponseEntity.ok(ApiResponse.success("Team members retrieved", members));
    }

    @PostMapping("/{id}/members")
    @PreAuthorize("hasAnyRole('COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TeamMemberDTO>> addMember(
            @PathVariable Integer id,
            @RequestBody TeamMemberRequest request) {
        TeamMemberDTO added = teamService.addMember(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Athlete added to team successfully", added));
    }

    @PostMapping("/{id}/members/batch")
    @PreAuthorize("hasAnyRole('COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<TeamMemberDTO>>> addMembersBatch(
            @PathVariable Integer id,
            @RequestBody TeamMemberRequest request) {
        List<TeamMemberDTO> added = teamService.addMembersBatch(id, request.getAthleteIds(), request.getRole());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Athletes added to team successfully", added));
    }

    @PutMapping("/{id}/members/{athleteId}")
    @PreAuthorize("hasAnyRole('COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TeamMemberDTO>> updateMember(
            @PathVariable Integer id,
            @PathVariable Integer athleteId,
            @RequestBody TeamMemberRequest request) {
        TeamMemberDTO updated = teamService.updateMember(id, athleteId, request);
        return ResponseEntity.ok(ApiResponse.success("Team member updated successfully", updated));
    }

    @DeleteMapping("/{id}/members/{athleteId}")
    @PreAuthorize("hasAnyRole('COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable Integer id,
            @PathVariable Integer athleteId) {
        teamService.removeMember(id, athleteId);
        return ResponseEntity.ok(ApiResponse.success("Athlete removed from team successfully", null));
    }

    @GetMapping("/{id}/available-athletes")
    @PreAuthorize("hasAnyRole('COACH', 'ORG_ADMIN', 'SUPER_ADMIN', 'ATHLETE')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAvailableAthletes(@PathVariable Integer id) {
        Integer orgId = tenantSecurityService.getCurrentUserOrganizationId();
        List<Map<String, Object>> athletes = teamService.getAvailableAthletes(id, orgId);
        return ResponseEntity.ok(ApiResponse.success("Available athletes retrieved", athletes));
    }

    @PostMapping("/{id}/join-requests")
    @PreAuthorize("hasAnyRole('ATHLETE', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<?>> requestToJoinTeam(
            @PathVariable Integer id,
            @RequestBody(required = false) TeamMemberRequest request) {
        Integer athleteId = null;
        if (tenantSecurityService.isAthlete()) {
            com.athletehub.api.entity.Athlete currentAthlete = tenantSecurityService.getCurrentAthlete();
            if (currentAthlete == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Athlete profile not found. Please complete your profile first."));
            }
            athleteId = currentAthlete.getId();
        } else if (request != null && request.getAthleteId() != null) {
            athleteId = request.getAthleteId();
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Athlete ID is required."));
        }

        TeamMemberDTO result = teamService.requestToJoinTeam(id, athleteId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Join request submitted to coach for review and approval.", result));
    }

    @GetMapping("/{id}/join-requests")
    @PreAuthorize("hasAnyRole('COACH', 'ORG_ADMIN', 'SUPER_ADMIN', 'ATHLETE')")
    public ResponseEntity<ApiResponse<List<TeamMemberDTO>>> getJoinRequests(@PathVariable Integer id) {
        List<TeamMemberDTO> requests = teamService.getJoinRequests(id);
        return ResponseEntity.ok(ApiResponse.success("Join requests retrieved successfully", requests));
    }

    @PutMapping("/{id}/join-requests/{athleteId}/approve")
    @PreAuthorize("hasAnyRole('COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<?>> approveJoinRequest(
            @PathVariable Integer id,
            @PathVariable Integer athleteId) {
        TeamDTO team = teamService.getTeamById(id);
        if (!tenantSecurityService.isSuperAdmin()) {
            Integer userOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (userOrgId != null && !userOrgId.equals(team.getOrganizationId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied."));
            }
            if (tenantSecurityService.isCoach()) {
                Coach coach = tenantSecurityService.getCurrentCoach();
                if (coach != null && team.getCoachId() != null && !coach.getId().equals(team.getCoachId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(ApiResponse.error("Only the assigned team coach or administrator can approve join requests."));
                }
            }
        }

        Integer reviewerId = tenantSecurityService.getCurrentUser() != null ? tenantSecurityService.getCurrentUser().getId() : null;
        TeamMemberDTO approved = teamService.approveJoinRequest(id, athleteId, reviewerId);
        return ResponseEntity.ok(ApiResponse.success("Athlete join request approved! Athlete is now an active member.", approved));
    }

    @PutMapping("/{id}/join-requests/{athleteId}/reject")
    @PreAuthorize("hasAnyRole('COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<?>> rejectJoinRequest(
            @PathVariable Integer id,
            @PathVariable Integer athleteId,
            @RequestBody(required = false) Map<String, String> body) {
        TeamDTO team = teamService.getTeamById(id);
        if (!tenantSecurityService.isSuperAdmin()) {
            Integer userOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (userOrgId != null && !userOrgId.equals(team.getOrganizationId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied."));
            }
            if (tenantSecurityService.isCoach()) {
                Coach coach = tenantSecurityService.getCurrentCoach();
                if (coach != null && team.getCoachId() != null && !coach.getId().equals(team.getCoachId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(ApiResponse.error("Only the assigned team coach or administrator can review join requests."));
                }
            }
        }

        String reason = body != null ? body.get("reason") : null;
        Integer reviewerId = tenantSecurityService.getCurrentUser() != null ? tenantSecurityService.getCurrentUser().getId() : null;
        TeamMemberDTO rejected = teamService.rejectJoinRequest(id, athleteId, reason, reviewerId);
        return ResponseEntity.ok(ApiResponse.success("Join request rejected.", rejected));
    }

    @DeleteMapping("/{id}/join-requests")
    @PreAuthorize("hasAnyRole('ATHLETE', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<?>> cancelJoinRequest(
            @PathVariable Integer id,
            @RequestParam(required = false) Integer athleteId) {
        Integer targetAthleteId = athleteId;
        if (tenantSecurityService.isAthlete()) {
            com.athletehub.api.entity.Athlete currentAthlete = tenantSecurityService.getCurrentAthlete();
            if (currentAthlete == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Athlete profile not found."));
            }
            targetAthleteId = currentAthlete.getId();
        }

        if (targetAthleteId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Athlete ID is required."));
        }

        teamService.cancelJoinRequest(id, targetAthleteId);
        return ResponseEntity.ok(ApiResponse.success("Join request cancelled successfully.", null));
    }
}
