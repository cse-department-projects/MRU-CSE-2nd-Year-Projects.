package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.entity.OrganizationJoinRequest;
import com.athletehub.api.entity.User;
import com.athletehub.api.security.TenantSecurityService;
import com.athletehub.api.service.OrganizationJoinRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.athletehub.api.entity.Coach;
import com.athletehub.api.entity.Organization;
import com.athletehub.api.entity.enums.CoachStatus;
import com.athletehub.api.repository.CoachRepository;
import com.athletehub.api.repository.OrganizationRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/organization-requests")
public class OrganizationJoinRequestController {

    private final OrganizationJoinRequestService requestService;
    private final TenantSecurityService tenantSecurityService;
    private final OrganizationRepository organizationRepository;
    private final CoachRepository coachRepository;

    public OrganizationJoinRequestController(OrganizationJoinRequestService requestService,
                                             TenantSecurityService tenantSecurityService,
                                             OrganizationRepository organizationRepository,
                                             CoachRepository coachRepository) {
        this.requestService = requestService;
        this.tenantSecurityService = tenantSecurityService;
        this.organizationRepository = organizationRepository;
        this.coachRepository = coachRepository;
    }

    @GetMapping("/available-organizations")
    public ResponseEntity<?> getAvailableOrganizations() {
        try {
            List<Organization> orgs = organizationRepository.findAll().stream()
                    .filter(o -> !"Deleted".equalsIgnoreCase(o.getStatus()) && !"Inactive".equalsIgnoreCase(o.getStatus()))
                    .collect(Collectors.toList());

            List<Map<String, Object>> result = orgs.stream().map(org -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", org.getId());
                map.put("name", org.getName());
                map.put("organizationCode", org.getOrganizationCode());
                map.put("city", org.getCity());
                map.put("state", org.getState());
                map.put("country", org.getCountry());
                map.put("email", org.getEmail());
                map.put("phone", org.getPhone());
                map.put("status", org.getStatus());
                map.put("organizationType", org.getOrganizationType() != null ? org.getOrganizationType().getName() : null);
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success("Available organizations retrieved successfully.", (Object) result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to fetch organizations: " + e.getMessage()));
        }
    }

    @PostMapping("/coach")
    @PreAuthorize("hasAnyRole('COACH', 'SUPER_ADMIN')")
    public ResponseEntity<?> submitCoachRequest(@RequestBody Map<String, Object> body) {
        try {
            User currentUser = tenantSecurityService.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required."));
            }

            Object orgIdObj = body.get("organizationId");
            if (orgIdObj == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("organizationId is required."));
            }
            Integer orgId = Integer.valueOf(orgIdObj.toString());

            String specialization = body.get("specialization") != null ? body.get("specialization").toString() : null;
            Integer experienceYears = body.get("experienceYears") != null ? Integer.valueOf(body.get("experienceYears").toString()) : 0;
            String qualification = body.get("qualification") != null ? body.get("qualification").toString() : null;
            String message = body.get("message") != null ? body.get("message").toString() : null;
            String phone = body.get("phone") != null ? body.get("phone").toString() : null;

            OrganizationJoinRequest req = requestService.submitCoachRequest(
                    currentUser.getId(), orgId, specialization, experienceYears, qualification, message, phone);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Join request submitted successfully to organization admin.", req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage() != null ? e.getMessage() : "Failed to submit join request."));
        }
    }

    @PostMapping("/athlete")
    @PreAuthorize("hasAnyRole('ATHLETE', 'SUPER_ADMIN')")
    public ResponseEntity<?> submitAthleteRequest(@RequestBody Map<String, Object> body) {
        try {
            User currentUser = tenantSecurityService.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required."));
            }

            Object orgIdObj = body.get("organizationId");
            if (orgIdObj == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("organizationId is required."));
            }
            Integer orgId = Integer.valueOf(orgIdObj.toString());

            Integer sportId = body.get("sportId") != null && !body.get("sportId").toString().isBlank() ?
                    Integer.valueOf(body.get("sportId").toString()) : null;
            Integer preferredCoachId = body.get("preferredCoachId") != null && !body.get("preferredCoachId").toString().isBlank() ?
                    Integer.valueOf(body.get("preferredCoachId").toString()) : null;
            String specialization = body.get("specialization") != null ? body.get("specialization").toString() : null;
            String message = body.get("message") != null ? body.get("message").toString() : null;
            String phone = body.get("phone") != null ? body.get("phone").toString() : null;

            OrganizationJoinRequest req = requestService.submitAthleteRequest(
                    currentUser.getId(), orgId, sportId, preferredCoachId, specialization, message, phone);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Join request submitted successfully to organization admin.", req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage() != null ? e.getMessage() : "Failed to submit join request."));
        }
    }

    @PostMapping("/join-by-code")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> joinByCode(@RequestBody Map<String, Object> body) {
        try {
            User currentUser = tenantSecurityService.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required."));
            }
            String code = body.get("organizationCode") != null ? body.get("organizationCode").toString() : null;
            Map<String, Object> result = requestService.joinByOrganizationCode(currentUser.getId(), code);
            return ResponseEntity.ok(ApiResponse.success("Joined organization successfully.", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage() != null ? e.getMessage() : "Failed to join organization."));
        }
    }

    @GetMapping("/organization-coaches")
    public ResponseEntity<?> getOrganizationCoaches(@RequestParam Integer organizationId, @RequestParam(required = false) Integer sportId) {
        try {
            List<Coach> coaches = coachRepository.findByOrganizationIdAndStatusNot(organizationId, CoachStatus.INACTIVE);
            List<Map<String, Object>> result = coaches.stream().map(c -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", c.getId());
                map.put("firstName", c.getFirstName());
                map.put("lastName", c.getLastName());
                map.put("fullName", c.getFirstName() + (c.getLastName() != null && !c.getLastName().isBlank() ? " " + c.getLastName() : ""));
                map.put("specialization", c.getSpecialization());
                map.put("experienceYears", c.getExperienceYears());
                map.put("qualification", c.getQualification());
                map.put("email", c.getEmail());
                return map;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success("Organization coaches retrieved.", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to fetch coaches: " + e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyRequests() {
        try {
            User currentUser = tenantSecurityService.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required."));
            }
            List<Map<String, Object>> requests = requestService.getMyRequests(currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Requests retrieved successfully.", requests));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage() != null ? e.getMessage() : "Failed to load requests."));
        }
    }

    @GetMapping("/my-active")
    public ResponseEntity<?> getMyActiveRequest() {
        try {
            User currentUser = tenantSecurityService.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required."));
            }
            Map<String, Object> active = requestService.getMyActivePendingRequest(currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Active pending request retrieved.", active));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage() != null ? e.getMessage() : "Failed to check active request."));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelMyRequest(@PathVariable Integer id) {
        try {
            User currentUser = tenantSecurityService.getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required."));
            }
            requestService.cancelMyRequest(currentUser.getId(), id);
            return ResponseEntity.ok(ApiResponse.success("Join request cancelled successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage() != null ? e.getMessage() : "Failed to cancel request."));
        }
    }

    @GetMapping("/organization")
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getOrganizationRequests(
            @RequestParam(required = false) Integer organizationId,
            @RequestParam(required = false) String status) {
        try {
            Integer targetOrgId = organizationId;
            if (!tenantSecurityService.isSuperAdmin()) {
                targetOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            }
            if (targetOrgId == null) {
                return ResponseEntity.ok(ApiResponse.success("No organization assigned.", List.of()));
            }

            List<Map<String, Object>> list = requestService.getOrganizationRequests(targetOrgId, status);
            return ResponseEntity.ok(ApiResponse.success("Organization join requests retrieved successfully.", list));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage() != null ? e.getMessage() : "Failed to load organization requests."));
        }
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> approveRequest(@PathVariable Integer id) {
        try {
            User currentUser = tenantSecurityService.getCurrentUser();
            Map<String, Object> approved = requestService.approveRequest(id, currentUser != null ? currentUser.getId() : null);
            return ResponseEntity.ok(ApiResponse.success("Coach join request approved. Coach has been provisioned into the organization.", approved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage() != null ? e.getMessage() : "Failed to approve request."));
        }
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'ORGANIZATION_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> rejectRequest(@PathVariable Integer id, @RequestBody(required = false) Map<String, Object> body) {
        try {
            User currentUser = tenantSecurityService.getCurrentUser();
            String reason = body != null && body.get("reason") != null ? body.get("reason").toString() : "Rejected by organization administrator.";
            Map<String, Object> rejected = requestService.rejectRequest(id, currentUser != null ? currentUser.getId() : null, reason);
            return ResponseEntity.ok(ApiResponse.success("Join request rejected.", rejected));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage() != null ? e.getMessage() : "Failed to reject request."));
        }
    }
}
