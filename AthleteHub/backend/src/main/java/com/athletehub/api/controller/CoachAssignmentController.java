package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.dto.CoachAssignmentMapper;
import com.athletehub.api.dto.CoachAssignmentRequest;
import com.athletehub.api.dto.CoachAssignmentResponse;
import com.athletehub.api.entity.CoachAssignment;
import com.athletehub.api.entity.User;
import com.athletehub.api.repository.UserRepository;
import com.athletehub.api.service.CoachAssignmentService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.athletehub.api.entity.enums.AssignmentStatus;
import com.athletehub.api.entity.Athlete;
import com.athletehub.api.repository.CoachAssignmentRepository;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/coach-assignments")
public class CoachAssignmentController {

    private final CoachAssignmentService assignmentService;
    private final UserRepository userRepository;
    private final CoachAssignmentMapper mapper;
    private final com.athletehub.api.security.TenantSecurityService tenantSecurityService;
    private final com.athletehub.api.repository.CoachRepository coachRepository;
    private final com.athletehub.api.repository.AthleteRepository athleteRepository;
    private final CoachAssignmentRepository coachAssignmentRepository;

    public CoachAssignmentController(CoachAssignmentService assignmentService, 
                                   UserRepository userRepository, 
                                   CoachAssignmentMapper mapper,
                                   com.athletehub.api.security.TenantSecurityService tenantSecurityService,
                                   com.athletehub.api.repository.CoachRepository coachRepository,
                                   com.athletehub.api.repository.AthleteRepository athleteRepository,
                                   CoachAssignmentRepository coachAssignmentRepository) {
        this.assignmentService = assignmentService;
        this.userRepository = userRepository;
        this.mapper = mapper;
        this.tenantSecurityService = tenantSecurityService;
        this.coachRepository = coachRepository;
        this.athleteRepository = athleteRepository;
        this.coachAssignmentRepository = coachAssignmentRepository;
    }

    private Integer getCurrentUserId() {
        User user = tenantSecurityService.getCurrentUser();
        return user != null ? user.getId() : null;
    }

    private boolean isSuperAdmin() {
        return tenantSecurityService.isSuperAdmin();
    }

    @PostMapping
    public ResponseEntity<?> createAssignment(@RequestBody CoachAssignmentRequest request) {
        if (!tenantSecurityService.isSuperAdmin() && !tenantSecurityService.isOrgAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Only administrators can assign coaches."));
        }

        if (!tenantSecurityService.isSuperAdmin()) {
            Integer userOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (userOrgId == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. No organization assigned."));
            }
            request.setOrganizationId(userOrgId);
        }

        List<String> errors = assignmentService.validateAssignmentRequest(request);
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Validation failed.", null, errors));
        }

        try {
            CoachAssignment assignment = assignmentService.createAssignment(getCurrentUserId(), request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Assignment created successfully.", mapper.toDto(assignment)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Creation failed.", null, List.of(e.getMessage())));
        }
    }

    @GetMapping("/candidates")
    public ResponseEntity<?> getAssignmentCandidates(@RequestParam Integer coachId) {
        if (!tenantSecurityService.isSuperAdmin() && !tenantSecurityService.isOrgAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied."));
        }

        com.athletehub.api.entity.Coach coach = coachRepository.findById(coachId).orElse(null);
        if (coach == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Coach not found."));
        }

        Integer userOrgId = tenantSecurityService.getCurrentUserOrganizationId();
        if (!tenantSecurityService.isSuperAdmin() && !coach.getOrganizationId().equals(userOrgId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Coach belongs to a different organization."));
        }

        List<Athlete> orgAthletes = athleteRepository.findByOrganizationIdAndStatusNot(coach.getOrganizationId(), "Deleted");
        List<CoachAssignment> activeAssignments = coachAssignmentRepository.findByCoachId(coachId).stream()
                .filter(a -> a.getStatus() == AssignmentStatus.ACTIVE)
                .collect(Collectors.toList());
        java.util.Set<Integer> assignedAthleteIds = activeAssignments.stream()
                .map(a -> a.getAthlete().getId())
                .collect(Collectors.toSet());

        String coachSpec = coach.getSpecialization() != null ? coach.getSpecialization().toLowerCase().trim() : "";

        List<Map<String, Object>> candidateList = new java.util.ArrayList<>();
        java.util.Set<String> uniqueSports = new java.util.TreeSet<>();

        for (Athlete a : orgAthletes) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("athleteCode", a.getAthleteCode());
            map.put("firstName", a.getFirstName());
            map.put("lastName", a.getLastName());
            map.put("fullName", (a.getFirstName() + " " + a.getLastName()).trim());
            map.put("gender", a.getGender());
            if (a.getDateOfBirth() != null) {
                map.put("age", java.time.Period.between(a.getDateOfBirth(), LocalDate.now()).getYears());
            }

            String sportName = a.getSport() != null ? a.getSport().getName() : "Unassigned Sport";
            String sportCategory = a.getSport() != null ? a.getSport().getCategory() : "";
            map.put("sportId", a.getSport() != null ? a.getSport().getId() : null);
            map.put("sportName", sportName);
            map.put("sportCategory", sportCategory);
            uniqueSports.add(sportName);

            boolean alreadyAssigned = assignedAthleteIds.contains(a.getId());
            map.put("isAlreadyAssigned", alreadyAssigned);

            // Check if matches coach sport
            boolean matchesSport = false;
            if (!coachSpec.isEmpty() && a.getSport() != null) {
                String sn = sportName.toLowerCase();
                String sc = sportCategory.toLowerCase();
                matchesSport = coachSpec.contains(sn) || sn.contains(coachSpec)
                        || coachSpec.contains(sc) || sc.contains(coachSpec)
                        || (coachSpec.contains("track") && (sn.contains("athletic") || sn.contains("track") || sn.contains("sprint")))
                        || (coachSpec.contains("sprint") && (sn.contains("athletic") || sn.contains("track")))
                        || (coachSpec.contains("racket") && (sn.contains("tennis") || sn.contains("badminton") || sn.contains("squash")))
                        || (coachSpec.contains("team") && (sn.contains("football") || sn.contains("basketball") || sn.contains("cricket")));
            }
            map.put("matchesCoachSport", matchesSport);

            candidateList.add(map);
        }

        Map<String, Object> coachInfo = new HashMap<>();
        coachInfo.put("id", coach.getId());
        coachInfo.put("coachCode", coach.getCoachCode() != null ? coach.getCoachCode() : "");
        coachInfo.put("fullName", (coach.getFirstName() + " " + coach.getLastName()).trim());
        coachInfo.put("specialization", coach.getSpecialization() != null ? coach.getSpecialization() : "");
        coachInfo.put("experienceYears", coach.getExperienceYears() != null ? coach.getExperienceYears() : 0);
        coachInfo.put("organizationId", coach.getOrganizationId());

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("coach", coachInfo);
        responseData.put("candidates", candidateList);
        responseData.put("uniqueSports", uniqueSports);

        return ResponseEntity.ok(ApiResponse.success("Candidates retrieved successfully.", responseData));
    }

    @PostMapping("/bulk")
    public ResponseEntity<?> createBulkAssignments(@RequestBody Map<String, Object> payload) {
        if (!tenantSecurityService.isSuperAdmin() && !tenantSecurityService.isOrgAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Only administrators can assign coaches."));
        }

        Integer coachId = payload.get("coachId") != null ? Integer.valueOf(payload.get("coachId").toString()) : null;
        if (coachId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("coachId is required."));
        }

        com.athletehub.api.entity.Coach coach = coachRepository.findById(coachId).orElse(null);
        if (coach == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Coach not found."));
        }

        Integer userOrgId = tenantSecurityService.getCurrentUserOrganizationId();
        if (!tenantSecurityService.isSuperAdmin() && !coach.getOrganizationId().equals(userOrgId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Coach belongs to a different organization."));
        }

        List<?> athleteIdsRaw = (List<?>) payload.get("athleteIds");
        if (athleteIdsRaw == null || athleteIdsRaw.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("At least one athleteId is required."));
        }

        String startDateStr = payload.get("startDate") != null ? payload.get("startDate").toString() : LocalDate.now().toString();
        LocalDate startDate = LocalDate.parse(startDateStr);
        String remarks = payload.get("remarks") != null ? payload.get("remarks").toString() : null;

        List<CoachAssignment> createdAssignments = new java.util.ArrayList<>();
        List<String> skippedErrors = new java.util.ArrayList<>();

        for (Object aIdObj : athleteIdsRaw) {
            Integer athleteId = Integer.valueOf(aIdObj.toString());
            CoachAssignmentRequest req = new CoachAssignmentRequest();
            req.setCoachId(coachId);
            req.setAthleteId(athleteId);
            req.setOrganizationId(coach.getOrganizationId());
            req.setStartDate(startDate);
            req.setStatus("ACTIVE");
            req.setRemarks(remarks);

            try {
                CoachAssignment asg = assignmentService.createAssignment(getCurrentUserId(), req);
                createdAssignments.add(asg);
            } catch (Exception e) {
                skippedErrors.add("Athlete #" + athleteId + ": " + e.getMessage());
            }
        }

        Map<String, Object> resData = new HashMap<>();
        resData.put("assignedCount", createdAssignments.size());
        resData.put("assignments", createdAssignments.stream().map(mapper::toDto).collect(Collectors.toList()));
        resData.put("skippedErrors", skippedErrors);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success("Successfully assigned " + createdAssignments.size() + " athletes to coach.", resData));
    }

    @GetMapping
    public ResponseEntity<?> getAssignments(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer organization_id,
            @RequestParam(required = false) Integer coach_id,
            @RequestParam(required = false) Integer athlete_id,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start_date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end_date,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int page_size,
            @RequestParam(defaultValue = "createdAt") String sort_by,
            @RequestParam(defaultValue = "desc") String sort_dir) {

        if ("created_at".equals(sort_by)) sort_by = "createdAt";
        if ("updated_at".equals(sort_by)) sort_by = "updatedAt";

        Integer targetOrgId = organization_id;
        Integer targetCoachId = coach_id;
        Integer targetAthleteId = athlete_id;

        if (tenantSecurityService.isSuperAdmin()) {
            targetOrgId = organization_id;
        } else if (tenantSecurityService.isOrgAdmin()) {
            targetOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (targetOrgId == null) targetOrgId = -1;
        } else if (tenantSecurityService.isCoach()) {
            targetOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (targetOrgId == null) targetOrgId = -1;
            com.athletehub.api.entity.Coach coach = tenantSecurityService.getCurrentCoach();
            targetCoachId = coach != null ? coach.getId() : -1;
        } else if (tenantSecurityService.isAthlete()) {
            targetOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (targetOrgId == null) targetOrgId = -1;
            com.athletehub.api.entity.Athlete athlete = tenantSecurityService.getCurrentAthlete();
            targetAthleteId = athlete != null ? athlete.getId() : -1;
        } else {
            targetOrgId = -1;
        }

        CoachAssignmentResponse result = assignmentService.searchAssignments(
                search, targetOrgId, targetCoachId, targetAthleteId, status, start_date, end_date, page, page_size, sort_by, sort_dir);

        Map<String, Object> pagination = Map.of(
            "page", result.getPage(),
            "page_size", result.getPageSize(),
            "total_records", result.getTotalRecords(),
            "total_pages", result.getTotalPages()
        );

        Map<String, Object> finalResponse = Map.of(
            "status", "success",
            "message", "Assignments retrieved successfully.",
            "data", result.getAssignments(),
            "pagination", pagination
        );

        return ResponseEntity.ok(finalResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAssignment(@PathVariable Integer id) {
        CoachAssignment assignment = assignmentService.getAssignmentById(id);
        if (assignment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Assignment not found."));
        }

        if (!tenantSecurityService.isSuperAdmin()) {
            Integer userOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (assignment.getOrganization() == null || !assignment.getOrganization().getId().equals(userOrgId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Assignment belongs to a different organization."));
            }
            if (tenantSecurityService.isCoach()) {
                com.athletehub.api.entity.Coach coach = tenantSecurityService.getCurrentCoach();
                if (coach == null || assignment.getCoach() == null || !coach.getId().equals(assignment.getCoach().getId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied: Not your assignment."));
                }
            } else if (tenantSecurityService.isAthlete()) {
                com.athletehub.api.entity.Athlete athlete = tenantSecurityService.getCurrentAthlete();
                if (athlete == null || assignment.getAthlete() == null || !athlete.getId().equals(assignment.getAthlete().getId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied: Not your assignment."));
                }
            }
        }

        return ResponseEntity.ok(ApiResponse.success("Assignment retrieved successfully.", mapper.toDto(assignment)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAssignment(@PathVariable Integer id, @RequestBody CoachAssignmentRequest request) {
        CoachAssignment existing = assignmentService.getAssignmentById(id);
        if (existing == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Assignment not found."));
        }

        if (!tenantSecurityService.isSuperAdmin()) {
            if (!tenantSecurityService.isOrgAdmin()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Insufficient permissions."));
            }
            Integer userOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (existing.getOrganization() == null || !existing.getOrganization().getId().equals(userOrgId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Assignment belongs to a different organization."));
            }
            request.setOrganizationId(userOrgId);
        }

        try {
            CoachAssignment updated = assignmentService.updateAssignment(id, request, getCurrentUserId(), isSuperAdmin());
            return ResponseEntity.ok(ApiResponse.success("Assignment updated successfully.", mapper.toDto(updated)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Update failed.", null, List.of(e.getMessage())));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelAssignment(@PathVariable Integer id) {
        CoachAssignment assignment = assignmentService.getAssignmentById(id);
        if (assignment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Assignment not found."));
        }

        if (!tenantSecurityService.isSuperAdmin()) {
            if (!tenantSecurityService.isOrgAdmin()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Insufficient permissions."));
            }
            Integer userOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (assignment.getOrganization() == null || !assignment.getOrganization().getId().equals(userOrgId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Assignment belongs to a different organization."));
            }
        }

        try {
            assignmentService.deleteAssignment(id, getCurrentUserId());
            return ResponseEntity.ok(ApiResponse.success("Assignment cancelled successfully.", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Assignment not found."));
        }
    }

    @GetMapping("/by-coach/{coachId}")
    public ResponseEntity<?> getByCoach(@PathVariable Integer coachId) {
        if (!tenantSecurityService.isSuperAdmin()) {
            if (tenantSecurityService.isCoach()) {
                com.athletehub.api.entity.Coach currentCoach = tenantSecurityService.getCurrentCoach();
                if (currentCoach == null || !currentCoach.getId().equals(coachId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Cannot view other coaches' assignments."));
                }
            } else if (tenantSecurityService.isOrgAdmin()) {
                com.athletehub.api.entity.Coach coach = coachRepository.findById(coachId).orElse(null);
                if (coach == null || !Objects.equals(coach.getOrganizationId(), tenantSecurityService.getCurrentUserOrganizationId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Coach belongs to a different organization."));
                }
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied."));
            }
        }

        List<CoachAssignment> assignments = assignmentService.getAssignmentsByCoach(coachId);
        return ResponseEntity.ok(ApiResponse.success("Success", assignments.stream().map(mapper::toDto).collect(Collectors.toList())));
    }

    @GetMapping("/by-athlete/{athleteId}")
    public ResponseEntity<?> getByAthlete(@PathVariable Integer athleteId) {
        com.athletehub.api.entity.Athlete athlete = athleteRepository.findById(athleteId).orElse(null);
        if (athlete == null || "Deleted".equals(athlete.getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Athlete not found."));
        }

        try {
            tenantSecurityService.validateAthleteAccess(athlete);
        } catch (org.springframework.security.access.AccessDeniedException ade) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(ade.getMessage()));
        }

        List<CoachAssignment> assignments = assignmentService.getAssignmentsByAthlete(athleteId);
        return ResponseEntity.ok(ApiResponse.success("Success", assignments.stream().map(mapper::toDto).collect(Collectors.toList())));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success("Stats retrieved", assignmentService.getDashboardStats()));
    }
}
