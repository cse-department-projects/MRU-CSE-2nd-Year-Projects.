package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.dto.AthleteRequestDTO;
import com.athletehub.api.entity.Athlete;
import com.athletehub.api.entity.User;
import com.athletehub.api.repository.AthleteRepository;
import com.athletehub.api.repository.UserRepository;
import com.athletehub.api.service.AthleteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/athletes")
public class AthleteController {

    private final AthleteService athleteService;
    private final AthleteRepository athleteRepository;
    private final UserRepository userRepository;
    private final com.athletehub.api.security.TenantSecurityService tenantSecurityService;

    public AthleteController(AthleteService athleteService, 
                             AthleteRepository athleteRepository, 
                             UserRepository userRepository,
                             com.athletehub.api.security.TenantSecurityService tenantSecurityService) {
        this.athleteService = athleteService;
        this.athleteRepository = athleteRepository;
        this.userRepository = userRepository;
        this.tenantSecurityService = tenantSecurityService;
    }

    private Integer getCurrentUserId() {
        User user = tenantSecurityService.getCurrentUser();
        return user != null ? user.getId() : null;
    }
    
    private boolean isSuperAdmin() {
        return tenantSecurityService.isSuperAdmin();
    }

    @PostMapping
    public ResponseEntity<?> createAthlete(@RequestBody AthleteRequestDTO data) {
        if (data == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid request payload."));
        }

        if (tenantSecurityService.isAthlete()) {
            return saveMyAthleteProfile(data);
        }

        if (tenantSecurityService.isCoach()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Insufficient permissions to create athlete profile."));
        }

        if (!tenantSecurityService.isSuperAdmin()) {
            Integer userOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (userOrgId == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Admin has no organization assigned."));
            }
            data.setOrganizationId(userOrgId);
        }

        List<String> errors = athleteService.validateAthleteData(data);
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Validation failed.", null, errors));
        }

        User currentUser = tenantSecurityService.getCurrentUser();
        Integer creatorId = currentUser != null ? currentUser.getId() : null;

        try {
            Athlete athlete = athleteService.createAthlete(null, creatorId, data);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Athlete profile created successfully.", athleteService.getAthleteDetails(athlete)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Creation failed.", null, List.of(e.getMessage())));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAthletes(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer sport_id,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) Integer minAge,
            @RequestParam(required = false) Integer maxAge,
            @RequestParam(required = false) Double minHeight,
            @RequestParam(required = false) Double maxHeight,
            @RequestParam(required = false) Double minWeight,
            @RequestParam(required = false) Double maxWeight,
            @RequestParam(required = false) String medicalStatus,
            @RequestParam(required = false) Integer organizationId,
            @RequestParam(required = false, defaultValue = "false") boolean forSquad,
            @RequestParam(required = false, defaultValue = "false") boolean forComparison,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int page_size,
            @RequestParam(defaultValue = "createdAt") String sort_by,
            @RequestParam(defaultValue = "desc") String sort_dir) {

        if ("created_at".equals(sort_by)) sort_by = "createdAt";
        if ("updated_at".equals(sort_by)) sort_by = "updatedAt";

        Integer targetOrgId = organizationId;
        List<Integer> allowedAthleteIds = null;

        if (tenantSecurityService.isSuperAdmin()) {
            targetOrgId = organizationId;
        } else if (tenantSecurityService.isOrgAdmin()) {
            targetOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (targetOrgId == null) targetOrgId = -1;
        } else if (tenantSecurityService.isCoach()) {
            targetOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (targetOrgId == null) targetOrgId = -1;
            if (forSquad || forComparison) {
                // Allow coach to discover and compare athletes within their organization
                allowedAthleteIds = null;
            } else {
                List<Integer> assigned = tenantSecurityService.getAssignedAthleteIdsForCurrentCoach();
                // If coach has specific assigned athletes, use them, otherwise allow org-wide view so coach is not blocked with 0 athletes
                allowedAthleteIds = (assigned != null && !assigned.isEmpty()) ? assigned : null;
            }
        } else if (tenantSecurityService.isAthlete()) {
            targetOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (targetOrgId == null) targetOrgId = -1;
            if (forSquad || forComparison) {
                // Allow athlete to discover peers within the same organization for team/squad formation or comparison
                allowedAthleteIds = null;
            } else {
                Athlete me = tenantSecurityService.getCurrentAthlete();
                allowedAthleteIds = (me != null) ? List.of(me.getId()) : java.util.Collections.emptyList();
            }
        } else if (tenantSecurityService.isRecruiter()) {
            targetOrgId = tenantSecurityService.getCurrentUserOrganizationId();
        } else {
            targetOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (targetOrgId == null) targetOrgId = -1;
        }

        Map<String, Object> result = athleteService.listAthletes(
            search, sport_id, status, gender, minAge, maxAge, 
            minHeight, maxHeight, minWeight, maxWeight, medicalStatus, targetOrgId,
            allowedAthleteIds,
            page, page_size, sort_by, sort_dir
        );

        Map<String, Object> pagination = Map.of(
            "page", result.get("page"),
            "page_size", result.get("page_size"),
            "total_records", result.get("total_records"),
            "total_pages", result.get("total_pages")
        );

        Map<String, Object> finalResponse = Map.of(
            "status", "success",
            "message", "Athletes retrieved successfully.",
            "data", result.get("items"),
            "pagination", pagination
        );

        return ResponseEntity.ok(finalResponse);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyAthleteProfile() {
        Athlete athlete = tenantSecurityService.getCurrentAthlete();
        if (athlete == null || "Deleted".equals(athlete.getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Athlete profile not found."));
        }
        return ResponseEntity.ok(ApiResponse.success("Athlete profile retrieved successfully.", athleteService.getAthleteDetails(athlete)));
    }

    @PostMapping("/me")
    public ResponseEntity<?> saveMyAthleteProfile(@RequestBody AthleteRequestDTO data) {
        if (data == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid request payload."));
        }

        User currentUser = tenantSecurityService.getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required."));
        }

        if (data.getFirstName() == null || data.getFirstName().isBlank()) {
            String fullName = currentUser.getFullName() != null ? currentUser.getFullName().trim() : "Athlete";
            String[] parts = fullName.split("\\s+", 2);
            data.setFirstName(parts[0]);
            if (data.getLastName() == null || data.getLastName().isBlank()) {
                data.setLastName(parts.length > 1 ? parts[1] : "User");
            }
        }

        if (currentUser.getOrganization() != null) {
            data.setOrganizationId(currentUser.getOrganization().getId());
        }

        List<String> errors = athleteService.validateAthleteData(data);
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Validation failed.", null, errors));
        }

        try {
            Athlete athlete = athleteService.createAthlete(currentUser.getId(), currentUser.getId(), data);
            return ResponseEntity.ok(ApiResponse.success("Athlete profile saved successfully.", athleteService.getAthleteDetails(athlete)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Failed to save athlete profile: " + e.getMessage(), null, null));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAthlete(@PathVariable Integer id) {
        Optional<Athlete> optAthlete = athleteRepository.findById(id);
        if (optAthlete.isEmpty() || "Deleted".equals(optAthlete.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Athlete not found."));
        }

        Athlete athlete = optAthlete.get();
        try {
            tenantSecurityService.validateAthleteInCurrentOrg(athlete);
        } catch (org.springframework.security.access.AccessDeniedException ade) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(ade.getMessage()));
        }

        return ResponseEntity.ok(ApiResponse.success("Athlete retrieved successfully.", athleteService.getAthleteDetails(athlete)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAthlete(@PathVariable Integer id, @RequestBody AthleteRequestDTO data) {
        Optional<Athlete> optAthlete = athleteRepository.findById(id);
        if (optAthlete.isEmpty() || "Deleted".equals(optAthlete.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Athlete not found."));
        }

        if (data == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid request payload."));
        }

        Athlete athlete = optAthlete.get();
        try {
            tenantSecurityService.validateAthleteAccess(athlete);
        } catch (org.springframework.security.access.AccessDeniedException ade) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(ade.getMessage()));
        }

        if (!tenantSecurityService.isSuperAdmin()) {
            data.setOrganizationId(athlete.getOrganizationId());
        }

        List<String> errors = athleteService.validateAthleteData(data);
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Validation failed.", null, errors));
        }

        Integer userId = getCurrentUserId();
        Athlete updated = athleteService.updateAthlete(athlete, data, userId);

        return ResponseEntity.ok(ApiResponse.success("Athlete updated successfully.", athleteService.getAthleteDetails(updated)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAthlete(@PathVariable Integer id) {
        Optional<Athlete> optAthlete = athleteRepository.findById(id);
        if (optAthlete.isEmpty() || "Deleted".equals(optAthlete.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Athlete not found."));
        }

        Athlete athlete = optAthlete.get();

        if (!tenantSecurityService.isSuperAdmin()) {
            if (!tenantSecurityService.isOrgAdmin()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Insufficient permissions."));
            }
            Integer userOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (userOrgId == null || athlete.getOrganizationId() == null || !userOrgId.equals(athlete.getOrganizationId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Athlete belongs to a different organization."));
            }
        }

        athlete.setStatus("Deleted");
        athleteRepository.save(athlete);

        return ResponseEntity.ok(ApiResponse.success("Athlete deleted successfully.", null));
    }
}
