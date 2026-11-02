package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.dto.TrainingPlanDTO;
import com.athletehub.api.dto.TrainingPlanRequest;
import com.athletehub.api.entity.Athlete;
import com.athletehub.api.entity.Coach;
import com.athletehub.api.entity.User;
import com.athletehub.api.entity.enums.TrainingPlanStatus;
import com.athletehub.api.repository.AthleteRepository;
import com.athletehub.api.repository.CoachRepository;
import com.athletehub.api.repository.UserRepository;
import com.athletehub.api.service.TrainingPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/training-plans")
public class TrainingPlanController {

    private final TrainingPlanService trainingPlanService;
    private final UserRepository userRepository;
    private final CoachRepository coachRepository;
    private final AthleteRepository athleteRepository;

    public TrainingPlanController(TrainingPlanService trainingPlanService, UserRepository userRepository,
                                  CoachRepository coachRepository, AthleteRepository athleteRepository) {
        this.trainingPlanService = trainingPlanService;
        this.userRepository = userRepository;
        this.coachRepository = coachRepository;
        this.athleteRepository = athleteRepository;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("Authenticated user was not found."));
    }

    private boolean isSuperAdmin(User user) {
        return "ROLE_SUPER_ADMIN".equals(user.getRole().getName());
    }

    private Integer getCurrentOrganizationId(User user) {
        if (user.getOrganization() != null) {
            return user.getOrganization().getId();
        }
        Coach coach = coachRepository.findByUserId(user.getId());
        if (coach != null && coach.getOrganizationId() != null) {
            return coach.getOrganizationId();
        }
        Athlete athlete = athleteRepository.findByUserId(user.getId());
        return athlete != null ? athlete.getOrganizationId() : null;
    }

    private void requirePlanAccess(TrainingPlanDTO plan, User user, boolean writeAccess) {
        if (isSuperAdmin(user)) {
            return;
        }
        Integer organizationId = getCurrentOrganizationId(user);
        if (organizationId == null || !organizationId.equals(plan.getOrganizationId())) {
            throw new SecurityException("This training plan belongs to a different organization.");
        }
        if (writeAccess && "ROLE_COACH".equals(user.getRole().getName())
                && !user.getId().equals(coachRepository.findById(plan.getCreatedBy())
                .map(Coach::getUserId).orElse(null))) {
            throw new SecurityException("Coaches can only manage training plans they created.");
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('COACH', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TrainingPlanDTO>> createTrainingPlan(@RequestBody TrainingPlanRequest request) {
        User user = getCurrentUser();
        if (!isSuperAdmin(user)) {
            Integer organizationId = getCurrentOrganizationId(user);
            if (organizationId == null) {
                throw new SecurityException("Your account is not linked to an organization.");
            }
            request.setOrganizationId(organizationId);
            if ("ROLE_COACH".equals(user.getRole().getName())) {
                Coach coach = coachRepository.findByUserId(user.getId());
                if (coach == null) {
                    throw new SecurityException("Your account does not have a coach profile.");
                }
                request.setCreatedBy(coach.getId());
            }
        }
        TrainingPlanDTO created = trainingPlanService.createTrainingPlan(request);
        return ResponseEntity.ok(ApiResponse.success("Training Plan created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('COACH', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TrainingPlanDTO>> updateTrainingPlan(@PathVariable Integer id, @RequestBody TrainingPlanRequest request) {
        requirePlanAccess(trainingPlanService.getTrainingPlanById(id), getCurrentUser(), true);
        TrainingPlanDTO updated = trainingPlanService.updateTrainingPlan(id, request);
        return ResponseEntity.ok(ApiResponse.success("Training Plan updated successfully", updated));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ATHLETE', 'COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TrainingPlanDTO>> getTrainingPlanById(@PathVariable Integer id) {
        TrainingPlanDTO plan = trainingPlanService.getTrainingPlanById(id);
        requirePlanAccess(plan, getCurrentUser(), false);
        return ResponseEntity.ok(ApiResponse.success("Training Plan retrieved successfully", plan));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('COACH', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTrainingPlan(@PathVariable Integer id) {
        requirePlanAccess(trainingPlanService.getTrainingPlanById(id), getCurrentUser(), true);
        trainingPlanService.deleteTrainingPlan(id);
        return ResponseEntity.ok(ApiResponse.success("Training Plan archived successfully"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ATHLETE', 'COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> searchTrainingPlans(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer organizationId,
            @RequestParam(required = false) Integer coachId,
            @RequestParam(required = false) Integer sportId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String difficultyLevel,
            Pageable pageable) {
        User user = getCurrentUser();
        if (!isSuperAdmin(user)) {
            organizationId = getCurrentOrganizationId(user);
            if (organizationId == null) {
                organizationId = -1;
            }
            if ("ROLE_COACH".equals(user.getRole().getName())) {
                Coach coach = coachRepository.findByUserId(user.getId());
                coachId = coach != null ? coach.getId() : -1;
            }
            if ("ROLE_ATHLETE".equals(user.getRole().getName())) {
                status = TrainingPlanStatus.ACTIVE.name();
            }
        }
        Page<TrainingPlanDTO> plans = trainingPlanService.searchTrainingPlans(search, organizationId, coachId, sportId, status, difficultyLevel, pageable);
        
        Map<String, Object> result = new HashMap<>();
        result.put("items", plans.getContent());
        result.put("total_records", plans.getTotalElements());
        result.put("total_pages", plans.getTotalPages());
        result.put("page", pageable.getPageNumber() + 1);
        result.put("page_size", pageable.getPageSize());
        
        return ResponseEntity.ok(ApiResponse.success("Training Plans retrieved successfully", result));
    }
}
