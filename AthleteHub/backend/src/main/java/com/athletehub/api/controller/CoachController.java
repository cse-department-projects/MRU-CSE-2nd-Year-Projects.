package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.dto.CoachDTO;
import com.athletehub.api.dto.CoachMapper;
import com.athletehub.api.dto.CoachRequest;
import com.athletehub.api.dto.CoachResponse;
import com.athletehub.api.entity.Coach;
import com.athletehub.api.entity.User;
import com.athletehub.api.entity.enums.CoachStatus;
import com.athletehub.api.repository.UserRepository;
import com.athletehub.api.service.CoachService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/coaches")
public class CoachController {

    private final CoachService coachService;
    private final UserRepository userRepository;
    private final CoachMapper coachMapper;
    private final com.athletehub.api.security.TenantSecurityService tenantSecurityService;

    public CoachController(CoachService coachService, 
                           UserRepository userRepository, 
                           CoachMapper coachMapper,
                           com.athletehub.api.security.TenantSecurityService tenantSecurityService) {
        this.coachService = coachService;
        this.userRepository = userRepository;
        this.coachMapper = coachMapper;
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
    public ResponseEntity<?> createCoach(@RequestBody CoachRequest request) {
        if (request == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid request payload."));
        }

        if (tenantSecurityService.isCoach() || tenantSecurityService.isAthlete()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Insufficient permissions to create coach profile."));
        }

        if (!tenantSecurityService.isSuperAdmin()) {
            Integer userOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (userOrgId == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Admin has no organization assigned."));
            }
            request.setOrganizationId(userOrgId);
        }

        List<String> errors = coachService.validateCoachRequest(request);
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Validation failed.", null, errors));
        }

        Integer userId = getCurrentUserId();
        try {
            Coach coach = coachService.createCoach(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Coach profile created successfully.", coachMapper.toDto(coach)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Creation failed.", null, List.of(e.getMessage())));
        }
    }

    @GetMapping
    public ResponseEntity<?> getCoaches(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer organization_id,
            @RequestParam(required = false) Integer sport_id,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int page_size,
            @RequestParam(defaultValue = "createdAt") String sort_by,
            @RequestParam(defaultValue = "desc") String sort_dir) {

        if ("created_at".equals(sort_by)) sort_by = "createdAt";
        if ("updated_at".equals(sort_by)) sort_by = "updatedAt";

        Integer targetOrgId = organization_id;
        if (!isSuperAdmin()) {
            targetOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (targetOrgId == null) {
                targetOrgId = -1;
            }
        }

        CoachResponse result = coachService.searchCoaches(search, targetOrgId, sport_id, specialization, status, page, page_size, sort_by, sort_dir);

        Map<String, Object> pagination = Map.of(
            "page", result.getPage(),
            "page_size", result.getPageSize(),
            "total_records", result.getTotalRecords(),
            "total_pages", result.getTotalPages()
        );

        Map<String, Object> finalResponse = Map.of(
            "status", "success",
            "message", "Coaches retrieved successfully.",
            "data", result.getCoaches(),
            "pagination", pagination
        );

        return ResponseEntity.ok(finalResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCoach(@PathVariable Integer id) {
        Coach coach = coachService.getCoachById(id);
        if (coach == null || coach.getStatus() == CoachStatus.DELETED) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Coach not found."));
        }

        try {
            tenantSecurityService.validateCoachAccess(coach);
        } catch (org.springframework.security.access.AccessDeniedException ade) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(ade.getMessage()));
        }

        return ResponseEntity.ok(ApiResponse.success("Coach retrieved successfully.", coachMapper.toDto(coach)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCoach(@PathVariable Integer id, @RequestBody CoachRequest request) {
        Coach coach = coachService.getCoachById(id);
        if (coach == null || coach.getStatus() == CoachStatus.DELETED) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Coach not found."));
        }

        if (request == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid request payload."));
        }

        try {
            tenantSecurityService.validateCoachAccess(coach);
        } catch (org.springframework.security.access.AccessDeniedException ade) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(ade.getMessage()));
        }

        if (!tenantSecurityService.isSuperAdmin()) {
            if (!tenantSecurityService.isOrgAdmin()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Insufficient permissions to update coach."));
            }
            request.setOrganizationId(coach.getOrganizationId());
        }

        List<String> errors = coachService.validateCoachRequest(request);
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Validation failed.", null, errors));
        }

        Integer userId = getCurrentUserId();
        try {
            Coach updated = coachService.updateCoach(id, request, userId);
            return ResponseEntity.ok(ApiResponse.success("Coach updated successfully.", coachMapper.toDto(updated)));
        } catch (Exception e) {
             return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Update failed.", null, List.of(e.getMessage())));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCoach(@PathVariable Integer id) {
        Coach coach = coachService.getCoachById(id);
        if (coach == null || coach.getStatus() == CoachStatus.DELETED) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Coach not found."));
        }

        if (!tenantSecurityService.isSuperAdmin()) {
            if (!tenantSecurityService.isOrgAdmin()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Insufficient permissions."));
            }
            Integer userOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (userOrgId == null || coach.getOrganizationId() == null || !userOrgId.equals(coach.getOrganizationId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Coach belongs to a different organization."));
            }
        }

        try {
            Integer userId = getCurrentUserId();
            coachService.softDeleteCoach(id, userId);
            return ResponseEntity.ok(ApiResponse.success("Coach deleted successfully.", null));
        } catch (Exception e) {
             return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Coach not found."));
        }
    }
    
    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        Map<String, Object> stats = coachService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics retrieved successfully.", stats));
    }
}
