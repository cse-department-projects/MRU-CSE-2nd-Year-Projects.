package com.athletehub.api.service;

import com.athletehub.api.dto.DashboardStatsDTO;
import com.athletehub.api.entity.Athlete;
import com.athletehub.api.entity.User;
import com.athletehub.api.repository.AthleteRepository;
import com.athletehub.api.repository.OrganizationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final OrganizationRepository organizationRepository;
    private final AthleteRepository athleteRepository;
    private final AthleteService athleteService;
    private final com.athletehub.api.repository.EventRepository eventRepository;
    private final com.athletehub.api.repository.TournamentRepository tournamentRepository;
    private final com.athletehub.api.repository.AthleteRegistrationRepository registrationRepository;
    private final com.athletehub.api.repository.MatchRepository matchRepository;
    private final com.athletehub.api.repository.MatchResultRepository matchResultRepository;
    private final com.athletehub.api.security.TenantSecurityService tenantSecurityService;

    public DashboardService(OrganizationRepository organizationRepository, 
                            AthleteRepository athleteRepository, 
                            AthleteService athleteService,
                            com.athletehub.api.repository.EventRepository eventRepository,
                            com.athletehub.api.repository.TournamentRepository tournamentRepository,
                            com.athletehub.api.repository.AthleteRegistrationRepository registrationRepository,
                            com.athletehub.api.repository.MatchRepository matchRepository,
                            com.athletehub.api.repository.MatchResultRepository matchResultRepository,
                            com.athletehub.api.security.TenantSecurityService tenantSecurityService) {
        this.organizationRepository = organizationRepository;
        this.athleteRepository = athleteRepository;
        this.athleteService = athleteService;
        this.eventRepository = eventRepository;
        this.tournamentRepository = tournamentRepository;
        this.registrationRepository = registrationRepository;
        this.matchRepository = matchRepository;
        this.matchResultRepository = matchResultRepository;
        this.tenantSecurityService = tenantSecurityService;
    }

    public DashboardStatsDTO getDashboardStats(User user, String roleName) {
        DashboardStatsDTO dto = new DashboardStatsDTO();
        dto.setWelcome("Welcome back, " + (user != null ? user.getFullName() : "User") + "!");
        dto.setRole(roleName);

        int profileCompletion = 0;
        if (("ROLE_ATHLETE".equals(roleName) || "ATHLETE".equals(roleName)) && user != null) {
            Athlete athlete = athleteRepository.findByUserId(user.getId());
            if (athlete != null) {
                profileCompletion = athleteService.calculateProfileCompletion(athlete);
                dto.setAthlete_id(athlete.getId());
            }
        }
        dto.setProfile_completion(profileCompletion);

        dto.setNotifications(List.of(
            Map.of("id", 1, "message", "Upcoming session at 4:00 PM", "type", "info"),
            Map.of("id", 2, "message", "New message from your coach", "type", "alert")
        ));

        dto.setQuick_actions(List.of(
            Map.of("id", "log_training", "label", "Log Training", "icon", "activity"),
            Map.of("id", "view_schedule", "label", "View Schedule", "icon", "calendar")
        ));

        LocalDateTime currentMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);

        DashboardStatsDTO.StatsDTO stats = new DashboardStatsDTO.StatsDTO();
        if (tenantSecurityService.isSuperAdmin()) {
            stats.setTotal_organizations(organizationRepository.countByStatusNot("Deleted"));
            stats.setActive_organizations(organizationRepository.countByStatus("Active"));
            stats.setOrgs_this_month(organizationRepository.countByStatusNotAndCreatedAtGreaterThanEqual("Deleted", currentMonth));
            stats.setTotal_athletes(athleteRepository.countByStatusNot("Deleted"));
            stats.setAthletes_without_organization(athleteRepository.countByStatusNotAndOrganizationIdIsNull("Deleted"));
        } else if (tenantSecurityService.isOrgAdmin()) {
            Integer userOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            stats.setTotal_organizations(userOrgId != null ? 1 : 0);
            stats.setActive_organizations(userOrgId != null ? 1 : 0);
            stats.setOrgs_this_month(0);
            stats.setTotal_athletes(userOrgId != null ? athleteRepository.countActiveAthletesByOrganizationId(userOrgId) : 0);
            stats.setAthletes_without_organization(0);
        } else if (tenantSecurityService.isCoach()) {
            stats.setTotal_organizations(1);
            stats.setActive_organizations(1);
            stats.setOrgs_this_month(0);
            stats.setTotal_athletes(tenantSecurityService.getAssignedAthleteIdsForCurrentCoach().size());
            stats.setAthletes_without_organization(0);
        } else if (tenantSecurityService.isAthlete()) {
            stats.setTotal_organizations(1);
            stats.setActive_organizations(1);
            stats.setOrgs_this_month(0);
            stats.setTotal_athletes(1);
            stats.setAthletes_without_organization(0);
        } else {
            stats.setTotal_organizations(0);
            stats.setActive_organizations(0);
            stats.setOrgs_this_month(0);
            stats.setTotal_athletes(0);
            stats.setAthletes_without_organization(0);
        }

        // Phase 7 Event Stats
        if (tenantSecurityService.isSuperAdmin()) {
            stats.setTotal_events(eventRepository.countByIsDeletedFalse());
            stats.setUpcoming_events(eventRepository.countByStatusAndIsDeletedFalse(com.athletehub.api.entity.enums.EventStatus.UPCOMING));
            stats.setActive_events(eventRepository.countByStatusAndIsDeletedFalse(com.athletehub.api.entity.enums.EventStatus.ACTIVE));
            stats.setCompleted_events(eventRepository.countByStatusAndIsDeletedFalse(com.athletehub.api.entity.enums.EventStatus.COMPLETED));
            stats.setCancelled_events(eventRepository.countByStatusAndIsDeletedFalse(com.athletehub.api.entity.enums.EventStatus.CANCELLED));
        } else if (tenantSecurityService.isOrgAdmin()) {
            Integer userOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (userOrgId != null) {
                stats.setTotal_events(eventRepository.countByOrganizationIdAndIsDeletedFalse(userOrgId));
                stats.setUpcoming_events(eventRepository.countByOrganizationIdAndStatusAndIsDeletedFalse(userOrgId, com.athletehub.api.entity.enums.EventStatus.UPCOMING));
                stats.setActive_events(eventRepository.countByOrganizationIdAndStatusAndIsDeletedFalse(userOrgId, com.athletehub.api.entity.enums.EventStatus.ACTIVE));
                stats.setCompleted_events(eventRepository.countByOrganizationIdAndStatusAndIsDeletedFalse(userOrgId, com.athletehub.api.entity.enums.EventStatus.COMPLETED));
                stats.setCancelled_events(eventRepository.countByOrganizationIdAndStatusAndIsDeletedFalse(userOrgId, com.athletehub.api.entity.enums.EventStatus.CANCELLED));
            } else {
                stats.setTotal_events(0);
                stats.setUpcoming_events(0);
                stats.setActive_events(0);
                stats.setCompleted_events(0);
                stats.setCancelled_events(0);
            }
        } else {
            stats.setTotal_events(0);
            stats.setUpcoming_events(0);
            stats.setActive_events(0);
            stats.setCompleted_events(0);
            stats.setCancelled_events(0);
        }

        stats.setActive_tournaments(tournamentRepository.countByStatus(com.athletehub.api.entity.enums.TournamentStatus.ACTIVE));
        stats.setCompleted_tournaments(tournamentRepository.countByStatus(com.athletehub.api.entity.enums.TournamentStatus.COMPLETED));
        stats.setTotal_participants(registrationRepository.countByStatus(com.athletehub.api.entity.enums.RegistrationStatus.PARTICIPATED));

        stats.setPending_registrations(registrationRepository.countByStatus(com.athletehub.api.entity.enums.RegistrationStatus.PENDING));
        stats.setApproved_registrations(registrationRepository.countByStatus(com.athletehub.api.entity.enums.RegistrationStatus.APPROVED));
        stats.setRejected_registrations(registrationRepository.countByStatus(com.athletehub.api.entity.enums.RegistrationStatus.REJECTED));
        stats.setWithdrawn_registrations(registrationRepository.countByStatus(com.athletehub.api.entity.enums.RegistrationStatus.WITHDRAWN));

        stats.setTodays_matches(matchRepository.countByMatchDate(java.time.LocalDate.now()));
        stats.setScheduled_matches(matchRepository.countByStatus(com.athletehub.api.entity.enums.MatchStatus.SCHEDULED));
        stats.setLive_matches(matchRepository.countByStatus(com.athletehub.api.entity.enums.MatchStatus.LIVE));
        stats.setCompleted_matches(matchRepository.countByStatus(com.athletehub.api.entity.enums.MatchStatus.COMPLETED));

        stats.setGold_medals(matchResultRepository.countByMedal(com.athletehub.api.entity.enums.Medal.GOLD));
        stats.setSilver_medals(matchResultRepository.countByMedal(com.athletehub.api.entity.enums.Medal.SILVER));
        stats.setBronze_medals(matchResultRepository.countByMedal(com.athletehub.api.entity.enums.Medal.BRONZE));
        stats.setTotal_medals(matchResultRepository.countByMedalNot(com.athletehub.api.entity.enums.Medal.NONE));

        dto.setStats(stats);
        return dto;
    }
}
