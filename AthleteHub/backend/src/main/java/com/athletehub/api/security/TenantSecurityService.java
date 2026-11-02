package com.athletehub.api.security;

import com.athletehub.api.entity.Athlete;
import com.athletehub.api.entity.Coach;
import com.athletehub.api.entity.User;
import com.athletehub.api.entity.enums.AssignmentStatus;
import com.athletehub.api.exception.ResourceNotFoundException;
import com.athletehub.api.repository.AthleteRepository;
import com.athletehub.api.repository.CoachAssignmentRepository;
import com.athletehub.api.repository.CoachRepository;
import com.athletehub.api.repository.SportRepository;
import com.athletehub.api.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TenantSecurityService {

    private final UserRepository userRepository;
    private final CoachRepository coachRepository;
    private final AthleteRepository athleteRepository;
    private final CoachAssignmentRepository coachAssignmentRepository;
    private final SportRepository sportRepository;

    public TenantSecurityService(UserRepository userRepository, 
                                 CoachRepository coachRepository, 
                                 AthleteRepository athleteRepository,
                                 CoachAssignmentRepository coachAssignmentRepository,
                                 SportRepository sportRepository) {
        this.userRepository = userRepository;
        this.coachRepository = coachRepository;
        this.athleteRepository = athleteRepository;
        this.coachAssignmentRepository = coachAssignmentRepository;
        this.sportRepository = sportRepository;
    }

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        String principal = auth.getName();
        if (principal == null) {
            return null;
        }
        return userRepository.findByEmailOrUsername(principal)
                .or(() -> userRepository.findByEmail(principal))
                .orElse(null);
    }

    public boolean isSuperAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_SUPER_ADMIN".equals(a.getAuthority()) || "SUPER_ADMIN".equals(a.getAuthority()));
    }

    public boolean isOrgAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ORG_ADMIN".equals(a.getAuthority()) || "ROLE_ORGANIZATION_ADMIN".equals(a.getAuthority()) || "ORG_ADMIN".equals(a.getAuthority()));
    }

    public boolean isCoach() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_COACH".equals(a.getAuthority()) || "COACH".equals(a.getAuthority()));
    }

    public boolean isAthlete() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ATHLETE".equals(a.getAuthority()) || "ATHLETE".equals(a.getAuthority()));
    }

    public boolean isRecruiter() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_RECRUITER".equals(a.getAuthority()) || "RECRUITER".equals(a.getAuthority()));
    }

    public Integer getCurrentUserOrganizationId() {
        User user = getCurrentUser();
        if (user == null) return null;
        if (user.getOrganization() != null) {
            return user.getOrganization().getId();
        }
        Coach coach = coachRepository.findByUserId(user.getId());
        if (coach != null && coach.getOrganizationId() != null) {
            return coach.getOrganizationId();
        }
        Athlete athlete = athleteRepository.findByUserId(user.getId());
        if (athlete != null && athlete.getOrganizationId() != null) {
            return athlete.getOrganizationId();
        }
        return null;
    }

    public Coach getCurrentCoach() {
        User user = getCurrentUser();
        if (user == null) return null;
        return coachRepository.findByUserId(user.getId());
    }

    public Athlete getCurrentAthlete() {
        User user = getCurrentUser();
        if (user == null) return null;
        return athleteRepository.findByUserId(user.getId());
    }

    public List<Integer> getAssignedAthleteIdsForCoach(Integer coachId) {
        if (coachId == null) return Collections.emptyList();
        return coachAssignmentRepository.findByCoachId(coachId).stream()
                .filter(ca -> ca.getStatus() == AssignmentStatus.ACTIVE && ca.getAthlete() != null)
                .map(ca -> ca.getAthlete().getId())
                .collect(Collectors.toList());
    }

    public List<Integer> getAssignedAthleteIdsForCurrentCoach() {
        Coach coach = getCurrentCoach();
        if (coach == null) return Collections.emptyList();
        return getAssignedAthleteIdsForCoach(coach.getId());
    }

    public List<Integer> getAuthorizedSportIdsForCoach(Coach coach) {
        if (coach == null) return Collections.emptyList();
        Set<Integer> sportIds = new HashSet<>();
        // 1. From active assigned athletes
        coachAssignmentRepository.findByCoachId(coach.getId()).stream()
                .filter(ca -> ca.getStatus() == AssignmentStatus.ACTIVE && ca.getAthlete() != null && ca.getAthlete().getSport() != null)
                .forEach(ca -> sportIds.add(ca.getAthlete().getSport().getId()));
        // 2. From coach specialization if it matches a sport
        if (coach.getSpecialization() != null && !coach.getSpecialization().trim().isEmpty()) {
            String spec = coach.getSpecialization().toLowerCase();
            sportRepository.findAll().stream()
                    .filter(s -> spec.contains(s.getName().toLowerCase()) || s.getName().toLowerCase().contains(spec))
                    .forEach(s -> sportIds.add(s.getId()));
        }
        return new ArrayList<>(sportIds);
    }

    public boolean isAthleteAssignedToCoach(Integer athleteId, Integer coachId) {
        if (athleteId == null || coachId == null) return false;
        return coachAssignmentRepository.existsByCoachIdAndAthleteIdAndStatus(coachId, athleteId, AssignmentStatus.ACTIVE);
    }

    public void validateAthleteAccess(Athlete athlete) {
        if (isSuperAdmin()) return;
        if (athlete == null) {
            throw new ResourceNotFoundException("Athlete not found");
        }
        User user = getCurrentUser();
        if (isAthlete()) {
            if (user == null || athlete.getUserId() == null || !athlete.getUserId().equals(user.getId())) {
                throw new AccessDeniedException("Access denied: Athletes can only access their own private profile.");
            }
            return;
        }
        if (isCoach()) {
            Coach coach = getCurrentCoach();
            if (coach == null || coach.getOrganizationId() == null || athlete.getOrganizationId() == null || !coach.getOrganizationId().equals(athlete.getOrganizationId())) {
                throw new AccessDeniedException("Access denied: Athlete belongs to a different organization.");
            }
            if (!isAthleteAssignedToCoach(athlete.getId(), coach.getId())) {
                throw new AccessDeniedException("Access denied: Coach is not assigned to this athlete.");
            }
            return;
        }
        if (isOrgAdmin()) {
            Integer userOrgId = getCurrentUserOrganizationId();
            if (userOrgId == null || athlete.getOrganizationId() == null || !userOrgId.equals(athlete.getOrganizationId())) {
                throw new AccessDeniedException("Access denied: Athlete belongs to a different organization.");
            }
            return;
        }
        if (isRecruiter()) {
            Integer userOrgId = getCurrentUserOrganizationId();
            if (userOrgId != null && athlete.getOrganizationId() != null && !userOrgId.equals(athlete.getOrganizationId())) {
                throw new AccessDeniedException("Access denied: Athlete belongs to a different organization.");
            }
            return;
        }
        throw new AccessDeniedException("Access denied.");
    }

    public void validateAthleteInCurrentOrg(Athlete athlete) {
        if (isSuperAdmin()) return;
        if (athlete == null) {
            throw new ResourceNotFoundException("Athlete not found");
        }
        Integer userOrgId = getCurrentUserOrganizationId();
        if (userOrgId == null || athlete.getOrganizationId() == null || !userOrgId.equals(athlete.getOrganizationId())) {
            throw new AccessDeniedException("Access denied: Athlete belongs to a different organization.");
        }
    }

    public void validateAthletePrivateAccess(Athlete athlete) {
        validateAthleteAccess(athlete);
    }

    public void validateCoachAccess(Coach coach) {
        if (isSuperAdmin()) return;
        if (coach == null) {
            throw new ResourceNotFoundException("Coach not found");
        }
        Integer userOrgId = getCurrentUserOrganizationId();
        if (userOrgId == null || coach.getOrganizationId() == null || !userOrgId.equals(coach.getOrganizationId())) {
            throw new AccessDeniedException("Access denied: Coach belongs to a different organization.");
        }
    }

    public void validateCoachInCurrentOrg(Coach coach) {
        validateCoachAccess(coach);
    }

    public void validateOrganizationAccess(Integer targetOrgId) {
        if (isSuperAdmin()) return;
        Integer userOrgId = getCurrentUserOrganizationId();
        if (userOrgId == null || targetOrgId == null || !userOrgId.equals(targetOrgId)) {
            throw new AccessDeniedException("Access denied: Organization access restricted.");
        }
    }

    public void validateSameOrganization(Integer targetOrgId, String entityName) {
        if (isSuperAdmin()) return;
        Integer userOrgId = getCurrentUserOrganizationId();
        if (userOrgId == null || targetOrgId == null || !userOrgId.equals(targetOrgId)) {
            throw new AccessDeniedException("Access denied: " + entityName + " belongs to a different organization.");
        }
    }

    public Integer getEffectiveOrganizationFilter(Integer requestedOrgId) {
        if (isSuperAdmin()) {
            return requestedOrgId;
        }
        Integer userOrgId = getCurrentUserOrganizationId();
        return userOrgId != null ? userOrgId : -1;
    }
}
