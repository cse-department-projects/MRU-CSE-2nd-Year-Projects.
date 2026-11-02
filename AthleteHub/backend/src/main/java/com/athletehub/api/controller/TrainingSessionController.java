package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.dto.TrainingSessionDTO;
import com.athletehub.api.dto.TrainingSessionRequest;
import com.athletehub.api.service.TrainingSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/training-sessions")
public class TrainingSessionController {

    @Autowired
    private TrainingSessionService trainingSessionService;

    @Autowired
    private com.athletehub.api.security.TenantSecurityService tenantSecurityService;

    @PostMapping
    @PreAuthorize("hasAnyRole('COACH', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TrainingSessionDTO>> createTrainingSession(@RequestBody TrainingSessionRequest request) {
        TrainingSessionDTO created = trainingSessionService.createTrainingSession(request);
        return ResponseEntity.ok(ApiResponse.success("Training Session created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('COACH', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TrainingSessionDTO>> updateTrainingSession(@PathVariable Integer id, @RequestBody TrainingSessionRequest request) {
        TrainingSessionDTO updated = trainingSessionService.updateTrainingSession(id, request);
        return ResponseEntity.ok(ApiResponse.success("Training Session updated successfully", updated));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TrainingSessionDTO>> getTrainingSessionById(@PathVariable Integer id) {
        TrainingSessionDTO session = trainingSessionService.getTrainingSessionById(id);
        return ResponseEntity.ok(ApiResponse.success("Training Session retrieved successfully", session));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('COACH', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTrainingSession(@PathVariable Integer id) {
        trainingSessionService.deleteTrainingSession(id);
        return ResponseEntity.ok(ApiResponse.success("Training Session cancelled successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> searchTrainingSessions(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer organizationId,
            @RequestParam(required = false) Integer coachId,
            @RequestParam(required = false) Integer athleteId,
            @RequestParam(required = false) Integer teamId,
            @RequestParam(required = false) Integer trainingPlanId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String intensity,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", required = false) Integer size,
            @RequestParam(value = "page_size", required = false) Integer pageSize,
            @RequestParam(value = "sort_by", defaultValue = "sessionDate") String sortBy,
            @RequestParam(value = "sort_dir", defaultValue = "desc") String sortDir) {

        Integer targetOrgId = organizationId;
        Integer targetCoachId = coachId;
        Integer targetAthleteId = athleteId;

        if (tenantSecurityService.isSuperAdmin()) {
            targetOrgId = organizationId;
            targetCoachId = coachId;
            targetAthleteId = athleteId;
        } else if (tenantSecurityService.isOrgAdmin()) {
            targetOrgId = tenantSecurityService.getCurrentUserOrganizationId();
        } else if (tenantSecurityService.isCoach()) {
            targetOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            com.athletehub.api.entity.Coach coach = tenantSecurityService.getCurrentCoach();
            targetCoachId = (coach != null) ? coach.getId() : -1;
        } else if (tenantSecurityService.isAthlete()) {
            targetOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            com.athletehub.api.entity.Athlete athlete = tenantSecurityService.getCurrentAthlete();
            targetAthleteId = (athlete != null) ? athlete.getId() : -1;
        } else {
            targetOrgId = -1;
        }

        // Support both 0-indexed (e.g. 0) and 1-indexed (e.g. 1) page params
        int effectivePage = (page > 0) ? page - 1 : 0;
        int effectiveSize = (pageSize != null && pageSize > 0) ? pageSize : ((size != null && size > 0) ? size : 10);
        
        org.springframework.data.domain.Sort sort = "asc".equalsIgnoreCase(sortDir) 
            ? org.springframework.data.domain.Sort.by(sortBy).ascending() 
            : org.springframework.data.domain.Sort.by(sortBy).descending();
        Pageable effectivePageable = org.springframework.data.domain.PageRequest.of(effectivePage, effectiveSize, sort);

        Page<TrainingSessionDTO> sessions = trainingSessionService.searchTrainingSessions(search, targetOrgId, targetCoachId, targetAthleteId, teamId, trainingPlanId, startDate, endDate, status, intensity, effectivePageable);
        
        Map<String, Object> result = new HashMap<>();
        result.put("items", sessions.getContent());
        result.put("total_records", sessions.getTotalElements());
        result.put("total_pages", sessions.getTotalPages());
        result.put("page", effectivePage + 1);
        result.put("page_size", effectiveSize);

        return ResponseEntity.ok(ApiResponse.success("Training Sessions retrieved successfully", result));
    }
}
