package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.dto.recruitment.*;
import com.athletehub.api.entity.enums.RecruitmentStage;
import com.athletehub.api.service.RecruitmentService;
import com.athletehub.api.service.RecruitmentImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.athletehub.api.entity.User;
import com.athletehub.api.repository.UserRepository;

import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/recruitment")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'RECRUITER', 'ORG_ADMIN', 'ORGANIZATION_ADMIN', 'ATHLETE')")
public class RecruitmentController {

    private final RecruitmentService recruitmentService;
    private final UserRepository userRepository;
    private final RecruitmentImportService recruitmentImportService;

    public RecruitmentController(RecruitmentService recruitmentService, UserRepository userRepository,
                                 RecruitmentImportService recruitmentImportService) {
        this.recruitmentService = recruitmentService;
        this.userRepository = userRepository;
        this.recruitmentImportService = recruitmentImportService;
    }

    private Integer getCurrentUserId(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email).map(User::getId).orElseThrow();
    }

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findById(getCurrentUserId(authentication)).orElseThrow();
    }

    private boolean isSuperAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_SUPER_ADMIN".equals(authority.getAuthority()));
    }

    private Integer getRecruitingOrganizationId(Authentication authentication) {
        User user = getCurrentUser(authentication);
        if (user.getOrganization() == null) {
            throw new SecurityException("Your account is not linked to an organization.");
        }
        return user.getOrganization().getId();
    }

    @GetMapping("/my-status")
    @PreAuthorize("hasAnyRole('ATHLETE')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMyRecruitmentStatus(Authentication authentication) {
        Integer userId = getCurrentUserId(authentication);
        List<Map<String, Object>> list = recruitmentService.getMyRecruitmentOpportunities(userId);
        return ResponseEntity.ok(ApiResponse.success("Recruitment opportunities retrieved", list));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'RECRUITER', 'ORG_ADMIN', 'ORGANIZATION_ADMIN')")
    public ResponseEntity<ApiResponse<RecruitmentDashboardDTO>> getDashboard(Authentication authentication) {
        Integer recruiterId = getCurrentUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("Dashboard metrics retrieved successfully", recruitmentService.getDashboardMetrics(recruiterId)));
    }

    @GetMapping("/prospects")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'RECRUITER', 'ORG_ADMIN', 'ORGANIZATION_ADMIN')")
    public ResponseEntity<ApiResponse<List<RecruitmentProspectDTO>>> getProspects(Authentication authentication) {
        Integer recruiterId = getCurrentUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("Prospects retrieved successfully", recruitmentService.getProspects(recruiterId)));
    }

    @GetMapping("/discover")
    public ResponseEntity<ApiResponse<List<com.athletehub.api.dto.AthleteResponseDTO>>> discoverAthletes(
            @RequestParam(required = false) Integer sportId,
            @RequestParam(required = false) Integer minAge,
            @RequestParam(required = false) Integer maxAge,
            @RequestParam(required = false) Integer minRating) {
        return ResponseEntity.ok(ApiResponse.success("Athletes discovered successfully", 
                recruitmentService.discoverAthletes(sportId, minAge, maxAge, minRating)));
    }

    @PostMapping("/prospects")
    public ResponseEntity<ApiResponse<RecruitmentProspectDTO>> addProspect(
            @RequestParam Integer athleteId,
            Authentication authentication) {
        Integer recruiterId = getCurrentUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("Prospect added successfully", recruitmentService.addProspect(athleteId, recruiterId, getRecruitingOrganizationId(authentication))));
    }

    @PostMapping(value = "/import", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<Map<String, Object>>> importProspects(
            @RequestParam MultipartFile file,
            @RequestParam Integer organizationId,
            Authentication authentication) {
        try {
            Integer recruiterId = getCurrentUserId(authentication);
            Map<String, Object> result = recruitmentImportService.importFile(file, recruiterId, organizationId);
            return ResponseEntity.ok(ApiResponse.success("Recruitment import completed.", result));
        } catch (Exception exception) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", exception.getMessage(), null, null));
        }
    }

    @PutMapping("/prospects/{id}/stage")
    public ResponseEntity<ApiResponse<RecruitmentProspectDTO>> updateStage(
            @PathVariable Integer id,
            @RequestParam RecruitmentStage stage,
            Authentication authentication) {
        Integer recruiterId = getCurrentUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("Stage updated successfully", recruitmentService.updateProspectStage(id, stage, recruiterId, isSuperAdmin(authentication))));
    }

    @GetMapping("/prospects/{id}/notes")
    public ResponseEntity<ApiResponse<List<RecruitmentNoteDTO>>> getNotes(@PathVariable Integer id, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("Notes retrieved successfully", recruitmentService.getNotes(id, getCurrentUserId(authentication), isSuperAdmin(authentication))));
    }

    @PostMapping("/prospects/{id}/notes")
    public ResponseEntity<ApiResponse<RecruitmentNoteDTO>> addNote(
            @PathVariable Integer id,
            @RequestBody RecruitmentNoteDTO request,
            Authentication authentication) {
        Integer recruiterId = getCurrentUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("Note added successfully", recruitmentService.addNote(id, recruiterId, request.getNoteText(), request.getRating(), isSuperAdmin(authentication))));
    }

    @GetMapping("/prospects/{id}/timeline")
    public ResponseEntity<ApiResponse<List<RecruitmentTimelineDTO>>> getTimeline(@PathVariable Integer id, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("Timeline retrieved successfully", recruitmentService.getTimeline(id, getCurrentUserId(authentication), isSuperAdmin(authentication))));
    }

    @GetMapping("/shortlists")
    public ResponseEntity<ApiResponse<List<RecruitmentShortlistDTO>>> getShortlists(Authentication authentication) {
        Integer recruiterId = getCurrentUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("Shortlists retrieved successfully", recruitmentService.getShortlists(recruiterId)));
    }

    @PostMapping("/shortlists")
    public ResponseEntity<ApiResponse<RecruitmentShortlistDTO>> createShortlist(
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        Integer recruiterId = getCurrentUserId(authentication);
        String name = body.getOrDefault("name", "New Shortlist");
        return ResponseEntity.ok(ApiResponse.success("Shortlist created successfully", recruitmentService.createShortlist(name, recruiterId)));
    }

    @PostMapping("/shortlists/{id}/athletes")
    public ResponseEntity<ApiResponse<Void>> addAthleteToShortlist(
            @PathVariable Integer id,
            @RequestParam Integer athleteId,
            Authentication authentication) {
        recruitmentService.addAthleteToShortlist(id, athleteId, getCurrentUserId(authentication), isSuperAdmin(authentication));
        return ResponseEntity.ok(ApiResponse.success("Athlete added to shortlist successfully", null));
    }

    @DeleteMapping("/shortlists/{id}/athletes/{athleteId}")
    public ResponseEntity<ApiResponse<Void>> removeAthleteFromShortlist(
            @PathVariable Integer id,
            @PathVariable Integer athleteId,
            Authentication authentication) {
        recruitmentService.removeAthleteFromShortlist(id, athleteId, getCurrentUserId(authentication), isSuperAdmin(authentication));
        return ResponseEntity.ok(ApiResponse.success("Athlete removed from shortlist successfully", null));
    }

    @GetMapping("/tasks")
    public ResponseEntity<ApiResponse<List<RecruitmentTaskDTO>>> getTasks(Authentication authentication) {
        Integer recruiterId = getCurrentUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("Tasks retrieved successfully", recruitmentService.getTasks(recruiterId)));
    }

    @PostMapping("/tasks")
    public ResponseEntity<ApiResponse<RecruitmentTaskDTO>> addTask(
            @RequestBody RecruitmentTaskDTO request,
            Authentication authentication) {
        Integer recruiterId = getCurrentUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("Task added successfully", recruitmentService.addTask(request, recruiterId, isSuperAdmin(authentication))));
    }
}


