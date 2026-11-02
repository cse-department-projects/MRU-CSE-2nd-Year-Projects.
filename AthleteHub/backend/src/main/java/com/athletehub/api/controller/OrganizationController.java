package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.entity.Organization;
import com.athletehub.api.entity.User;
import com.athletehub.api.entity.Coach;
import com.athletehub.api.repository.AthleteRepository;
import com.athletehub.api.repository.OrganizationRepository;
import com.athletehub.api.repository.UserRepository;
import com.athletehub.api.service.AthleteService;
import com.athletehub.api.service.OrganizationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.athletehub.api.repository.RoleRepository;
import com.athletehub.api.service.CoachService;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;
    private final OrganizationRepository organizationRepository;
    private final AthleteRepository athleteRepository;
    private final AthleteService athleteService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final CoachService coachService;
    private final com.athletehub.api.security.TenantSecurityService tenantSecurityService;

    public OrganizationController(OrganizationService organizationService, 
                                  OrganizationRepository organizationRepository, 
                                  AthleteRepository athleteRepository, 
                                  AthleteService athleteService, 
                                  UserRepository userRepository, 
                                  RoleRepository roleRepository, 
                                  PasswordEncoder passwordEncoder, 
                                  CoachService coachService,
                                  com.athletehub.api.security.TenantSecurityService tenantSecurityService) {
        this.organizationService = organizationService;
        this.organizationRepository = organizationRepository;
        this.athleteRepository = athleteRepository;
        this.athleteService = athleteService;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.coachService = coachService;
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
    public ResponseEntity<?> createOrganization(@RequestBody Map<String, Object> data) {
        if (!isSuperAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Insufficient permissions."));
        }

        if (data == null || data.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid request payload."));
        }

        List<String> errors = organizationService.validateOrganizationData(data);
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Validation failed.", null, errors));
        }

        Integer userId = getCurrentUserId();
        try {
            Organization org = organizationService.createOrganization(userId, data);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Organization created successfully.", organizationService.getOrganizationDetails(org, 0)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Creation failed.", null, List.of(e.getMessage())));
        }
    }

    @GetMapping
    public ResponseEntity<?> getOrganizations(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer organization_type_id,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int page_size,
            @RequestParam(defaultValue = "createdAt") String sort_by,
            @RequestParam(defaultValue = "desc") String sort_dir) {

        if (tenantSecurityService.isCoach() || tenantSecurityService.isAthlete() || tenantSecurityService.isRecruiter()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Organization management is restricted to administrators."));
        }

        if (tenantSecurityService.isOrgAdmin() && !tenantSecurityService.isSuperAdmin()) {
            Integer userOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (userOrgId == null) {
                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Organizations retrieved successfully.",
                    "data", List.of(),
                    "pagination", Map.of("page", 1, "page_size", page_size, "total_records", 0, "total_pages", 0)
                ));
            }
            Optional<Organization> optOrg = organizationRepository.findById(userOrgId);
            if (optOrg.isEmpty() || "Deleted".equals(optOrg.get().getStatus())) {
                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Organizations retrieved successfully.",
                    "data", List.of(),
                    "pagination", Map.of("page", 1, "page_size", page_size, "total_records", 0, "total_pages", 0)
                ));
            }
            Organization org = optOrg.get();
            if (search != null && !search.trim().isEmpty()) {
                String q = search.toLowerCase();
                boolean matches = org.getName().toLowerCase().contains(q) ||
                        (org.getOrganizationCode() != null && org.getOrganizationCode().toLowerCase().contains(q)) ||
                        (org.getEmail() != null && org.getEmail().toLowerCase().contains(q));
                if (!matches) {
                    return ResponseEntity.ok(Map.of(
                        "status", "success",
                        "message", "Organizations retrieved successfully.",
                        "data", List.of(),
                        "pagination", Map.of("page", 1, "page_size", page_size, "total_records", 0, "total_pages", 0)
                    ));
                }
            }
            long athleteCount = athleteRepository.countActiveAthletesByOrganizationId(userOrgId);
            Map<String, Object> orgDetails = organizationService.getOrganizationDetails(org, athleteCount);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Organizations retrieved successfully.",
                "data", List.of(orgDetails),
                "pagination", Map.of("page", 1, "page_size", page_size, "total_records", 1, "total_pages", 1)
            ));
        }

        if (!tenantSecurityService.isSuperAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Insufficient permissions."));
        }

        if ("created_at".equals(sort_by)) sort_by = "createdAt";
        if ("updated_at".equals(sort_by)) sort_by = "updatedAt";

        Map<String, Object> result = organizationService.listOrganizations(search, organization_type_id, status, city, state, page, page_size, sort_by, sort_dir);

        Map<String, Object> pagination = Map.of(
            "page", result.get("page"),
            "page_size", result.get("page_size"),
            "total_records", result.get("total_records"),
            "total_pages", result.get("total_pages")
        );

        Map<String, Object> finalResponse = Map.of(
            "status", "success",
            "message", "Organizations retrieved successfully.",
            "data", result.get("items"),
            "pagination", pagination
        );

        return ResponseEntity.ok(finalResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrganization(@PathVariable Integer id) {
        if (!tenantSecurityService.isSuperAdmin()) {
            Integer userOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (userOrgId == null || !userOrgId.equals(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. You can only access your own organization."));
            }
        }

        Optional<Organization> optOrg = organizationRepository.findById(id);
        if (optOrg.isEmpty() || "Deleted".equals(optOrg.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Organization not found."));
        }

        long athleteCount = athleteRepository.countActiveAthletesByOrganizationId(id);
        return ResponseEntity.ok(ApiResponse.success("Organization retrieved successfully.", organizationService.getOrganizationDetails(optOrg.get(), athleteCount)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrganization(@PathVariable Integer id, @RequestBody Map<String, Object> data) {
        boolean canUpdate = isSuperAdmin() || 
                (tenantSecurityService.isOrgAdmin() && id.equals(tenantSecurityService.getCurrentUserOrganizationId()));
        if (!canUpdate) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Insufficient permissions."));
        }

        Optional<Organization> optOrg = organizationRepository.findById(id);
        if (optOrg.isEmpty() || "Deleted".equals(optOrg.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Organization not found."));
        }

        if (data == null || data.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid request payload."));
        }

        List<String> errors = organizationService.validateOrganizationData(data);
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Validation failed.", null, errors));
        }

        Integer userId = getCurrentUserId();
        try {
            Organization updated = organizationService.updateOrganization(optOrg.get(), data, userId);
            long athleteCount = athleteRepository.countActiveAthletesByOrganizationId(id);
            return ResponseEntity.ok(ApiResponse.success("Organization updated successfully.", organizationService.getOrganizationDetails(updated, athleteCount)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", "Update failed.", null, List.of(e.getMessage())));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrganization(@PathVariable Integer id) {
        if (!isSuperAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Insufficient permissions."));
        }

        Optional<Organization> optOrg = organizationRepository.findById(id);
        if (optOrg.isEmpty() || "Deleted".equals(optOrg.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Organization not found."));
        }

        Organization org = optOrg.get();
        org.setStatus("Deleted");
        org.setName(org.getName() + "_DELETED_" + System.currentTimeMillis());
        org.setUpdatedBy(getCurrentUserId());
        organizationRepository.save(org);

        return ResponseEntity.ok(ApiResponse.success("Organization deleted successfully.", null));
    }

    @GetMapping("/{id}/athletes")
    public ResponseEntity<?> getOrganizationAthletes(@PathVariable Integer id) {
        if (!tenantSecurityService.isSuperAdmin()) {
            Integer userOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (userOrgId == null || !userOrgId.equals(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied."));
            }
        }

        Optional<Organization> optOrg = organizationRepository.findById(id);
        if (optOrg.isEmpty() || "Deleted".equals(optOrg.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Organization not found."));
        }

        List<com.athletehub.api.dto.AthleteResponseDTO> athletesData = athleteRepository.findByOrganizationIdAndStatusNot(id, "Deleted")
                .stream()
                .filter(a -> {
                    if (tenantSecurityService.isCoach() && !tenantSecurityService.isSuperAdmin() && !tenantSecurityService.isOrgAdmin()) {
                        Coach coach = tenantSecurityService.getCurrentCoach();
                        return coach != null && tenantSecurityService.isAthleteAssignedToCoach(a.getId(), coach.getId());
                    }
                    return true;
                })
                .map(athleteService::getAthleteDetails)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Athletes retrieved successfully.", athletesData));
    }

    @GetMapping("/{id}/admin")
    public ResponseEntity<?> getOrganizationAdmin(@PathVariable Integer id) {
        if (!tenantSecurityService.isSuperAdmin()) {
            Integer userOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (userOrgId == null || !userOrgId.equals(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied."));
            }
        }

        Optional<Organization> optOrg = organizationRepository.findById(id);
        if (optOrg.isEmpty() || "Deleted".equals(optOrg.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Organization not found."));
        }

        List<User> admins = userRepository.findByRoleName("ROLE_ORG_ADMIN").stream()
                .filter(u -> u.getOrganization() != null && u.getOrganization().getId().equals(id))
                .collect(Collectors.toList());

        if (admins.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success("No administrator assigned to this organization.", null));
        }

        User admin = admins.get(0);
        Map<String, Object> adminData = new HashMap<>();
        adminData.put("id", admin.getId());
        adminData.put("fullName", admin.getFullName());
        adminData.put("email", admin.getEmail());
        adminData.put("phone", admin.getPhone());
        adminData.put("status", admin.getStatus());

        return ResponseEntity.ok(ApiResponse.success("Administrator retrieved successfully.", adminData));
    }

    @PostMapping("/{id}/admin")
    public ResponseEntity<?> assignOrganizationAdmin(@PathVariable Integer id, @RequestBody Map<String, Object> payload) {
        if (!isSuperAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Insufficient permissions."));
        }

        Optional<Organization> optOrg = organizationRepository.findById(id);
        if (optOrg.isEmpty() || "Deleted".equals(optOrg.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Organization not found."));
        }

        Organization org = optOrg.get();

        if (payload.containsKey("userId") && payload.get("userId") != null) {
            Integer userId = ((Number) payload.get("userId")).intValue();
            Optional<User> optUser = userRepository.findById(userId);
            if (optUser.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User not found."));
            }

            User user = optUser.get();
            if (!"ROLE_ORG_ADMIN".equals(user.getRole().getName())) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Selected user does not have ROLE_ORG_ADMIN role."));
            }

            if (user.getOrganization() != null && !user.getOrganization().getId().equals(id)) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Selected administrator is already assigned to organization: " + user.getOrganization().getName()));
            }

            user.setOrganization(org);
            userRepository.save(user);

            return ResponseEntity.ok(ApiResponse.success("Administrator assigned successfully.", null));
        } else {
            String emailStr = (String) payload.get("email");
            String fullNameStr = (String) payload.get("fullName");
            String passwordStr = (String) payload.get("password");
            String phoneStr = (String) payload.get("phone");

            if (emailStr == null || emailStr.trim().isEmpty() ||
                fullNameStr == null || fullNameStr.trim().isEmpty() ||
                passwordStr == null || passwordStr.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Missing required fields: email, fullName, password."));
            }

            if (userRepository.existsByEmail(emailStr)) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Email is already registered."));
            }

            Optional<com.athletehub.api.entity.Role> roleOpt = roleRepository.findByName("ROLE_ORG_ADMIN");
            if (roleOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("ROLE_ORG_ADMIN role not found."));
            }

            User user = new User();
            user.setFullName(fullNameStr);
            user.setEmail(emailStr);
            user.setPhone(phoneStr);
            user.setPasswordHash(passwordEncoder.encode(passwordStr));
            user.setRole(roleOpt.get());
            user.setOrganization(org);
            userRepository.save(user);

            return ResponseEntity.ok(ApiResponse.success("Administrator account created and assigned successfully.", null));
        }
    }

    @GetMapping("/unassigned-admins")
    public ResponseEntity<?> getUnassignedAdmins() {
        if (!isSuperAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied. Insufficient permissions."));
        }

        List<Map<String, Object>> list = userRepository.findUnassignedAdmins().stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("fullName", u.getFullName());
            m.put("email", u.getEmail());
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Unassigned administrators retrieved successfully.", list));
    }

    @GetMapping("/{id}/coaches")
    public ResponseEntity<?> getOrganizationCoaches(@PathVariable Integer id) {
        if (!tenantSecurityService.isSuperAdmin()) {
            Integer userOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            if (userOrgId == null || !userOrgId.equals(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied."));
            }
        }

        Optional<Organization> optOrg = organizationRepository.findById(id);
        if (optOrg.isEmpty() || "Deleted".equals(optOrg.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Organization not found."));
        }

        List<com.athletehub.api.dto.CoachDTO> coachesData = coachService.searchCoaches(null, id, null, null, 1, 200, "createdAt", "desc")
                .getCoaches();

        return ResponseEntity.ok(ApiResponse.success("Coaches retrieved successfully.", coachesData));
    }

    @GetMapping("/overview-matrix")
    public ResponseEntity<?> getOverviewMatrix() {
        if (!isSuperAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access restricted to Super Administrators."));
        }

        List<Organization> orgs = organizationRepository.findAll().stream()
                .filter(o -> !"Deleted".equalsIgnoreCase(o.getStatus()))
                .collect(Collectors.toList());

        List<Map<String, Object>> matrix = new java.util.ArrayList<>();
        
        long totalUsersCount = userRepository.count();
        long totalAthletesCount = athleteRepository.countByStatusNot("Deleted");
        long unassignedAthletesCount = athleteRepository.countByStatusNotAndOrganizationIdIsNull("Deleted");

        // Role totals
        long totalOrgAdmins = 0;
        long totalCoaches = 0;
        long totalAthletesWithUser = 0;

        List<Object[]> allRoleCounts = userRepository.countAllUsersByRole();
        for (Object[] row : allRoleCounts) {
            String roleName = row[0] != null ? row[0].toString() : "";
            long count = ((Number) row[1]).longValue();
            if ("ROLE_ORG_ADMIN".equals(roleName) || "ROLE_ORGANIZATION_ADMIN".equals(roleName)) {
                totalOrgAdmins += count;
            } else if ("ROLE_COACH".equals(roleName)) {
                totalCoaches += count;
            } else if ("ROLE_ATHLETE".equals(roleName)) {
                totalAthletesWithUser += count;
            }
        }

        for (Organization org : orgs) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", org.getId());
            item.put("name", org.getName());
            item.put("organizationCode", org.getOrganizationCode());
            item.put("status", org.getStatus());
            item.put("city", org.getCity());
            item.put("state", org.getState());
            item.put("country", org.getCountry());
            item.put("email", org.getEmail());
            item.put("phone", org.getPhone());
            item.put("createdAt", org.getCreatedAt());

            // Org Admin details
            List<User> admins = userRepository.findOrgAdminsByOrganizationId(org.getId());
            if (!admins.isEmpty()) {
                User primaryAdmin = admins.get(0);
                Map<String, Object> adminData = new HashMap<>();
                adminData.put("id", primaryAdmin.getId());
                adminData.put("name", primaryAdmin.getFullName());
                adminData.put("email", primaryAdmin.getEmail());
                adminData.put("phone", primaryAdmin.getPhone() != null ? primaryAdmin.getPhone() : org.getPhone());
                adminData.put("status", primaryAdmin.getStatus());
                item.put("orgAdmin", adminData);
            } else {
                item.put("orgAdmin", null);
            }

            // User roles breakdown
            long orgAdminCount = 0;
            long coachCount = 0;
            long athleteUserCount = 0;
            List<Object[]> roleCounts = userRepository.countUsersByRoleInOrganization(org.getId());
            for (Object[] r : roleCounts) {
                String role = r[0] != null ? r[0].toString() : "";
                long count = ((Number) r[1]).longValue();
                if ("ROLE_ORG_ADMIN".equals(role) || "ROLE_ORGANIZATION_ADMIN".equals(role)) {
                    orgAdminCount += count;
                } else if ("ROLE_COACH".equals(role)) {
                    coachCount += count;
                } else if ("ROLE_ATHLETE".equals(role)) {
                    athleteUserCount += count;
                }
            }

            // Total athletes in this org (from athletes table)
            long orgAthletes = athleteRepository.countActiveAthletesByOrganizationId(org.getId());

            Map<String, Object> counts = new HashMap<>();
            counts.put("totalUsers", userRepository.countByOrganizationId(org.getId()));
            counts.put("orgAdmins", orgAdminCount);
            counts.put("coaches", coachCount);
            counts.put("athletes", orgAthletes);
            counts.put("athleteUsers", athleteUserCount);
            item.put("counts", counts);

            matrix.add(item);
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalOrganizations", orgs.size());
        summary.put("activeOrganizations", orgs.stream().filter(o -> "Active".equalsIgnoreCase(o.getStatus())).count());
        summary.put("totalPlatformUsers", totalUsersCount);
        summary.put("totalOrgAdmins", totalOrgAdmins);
        summary.put("totalCoaches", totalCoaches);
        summary.put("totalAthletes", totalAthletesCount);
        summary.put("unassignedAthletes", unassignedAthletesCount);

        Map<String, Object> response = new HashMap<>();
        response.put("summary", summary);
        response.put("organizations", matrix);

        return ResponseEntity.ok(ApiResponse.success("Overview matrix retrieved successfully.", response));
    }
}
