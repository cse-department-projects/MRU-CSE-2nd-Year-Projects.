package com.athletehub.api.service;

import com.athletehub.api.dto.CoachDTO;
import com.athletehub.api.dto.CoachMapper;
import com.athletehub.api.dto.CoachRequest;
import com.athletehub.api.dto.CoachResponse;
import com.athletehub.api.entity.Coach;
import com.athletehub.api.entity.Organization;
import com.athletehub.api.entity.User;
import com.athletehub.api.entity.enums.CoachStatus;
import com.athletehub.api.entity.enums.Gender;
import com.athletehub.api.repository.CoachRepository;
import com.athletehub.api.repository.OrganizationRepository;
import com.athletehub.api.repository.UserRepository;
import com.athletehub.api.repository.RoleRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CoachServiceImpl implements CoachService {

    private final CoachRepository coachRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final CoachMapper coachMapper;
    private final RoleRepository roleRepository;
    private final com.athletehub.api.repository.CoachAssignmentRepository coachAssignmentRepository;
    private final com.athletehub.api.repository.SportRepository sportRepository;
    private final com.athletehub.api.security.TenantSecurityService tenantSecurityService;

    public CoachServiceImpl(CoachRepository coachRepository, 
                            OrganizationRepository organizationRepository, 
                            UserRepository userRepository, 
                            CoachMapper coachMapper, 
                            RoleRepository roleRepository,
                            com.athletehub.api.repository.CoachAssignmentRepository coachAssignmentRepository,
                            com.athletehub.api.repository.SportRepository sportRepository,
                            com.athletehub.api.security.TenantSecurityService tenantSecurityService) {
        this.coachRepository = coachRepository;
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.coachMapper = coachMapper;
        this.roleRepository = roleRepository;
        this.coachAssignmentRepository = coachAssignmentRepository;
        this.sportRepository = sportRepository;
        this.tenantSecurityService = tenantSecurityService;
    }

    @Override
    @Transactional
    public Coach createCoach(Integer userId, CoachRequest request) throws Exception {
        Integer coachUserId = null;
        User currentUser = userId != null ? userRepository.findById(userId).orElse(null) : null;
        if (currentUser != null && currentUser.getRole() != null && "ROLE_COACH".equals(currentUser.getRole().getName())) {
            coachUserId = currentUser.getId();
        }
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            User userByEmail = userRepository.findByEmail(request.getEmail().trim()).orElse(null);
            if (userByEmail != null) {
                coachUserId = userByEmail.getId();
            }
        }

        if (coachUserId != null) {
            Coach existing = coachRepository.findByUserId(coachUserId);
            if (existing != null) {
                return updateCoach(existing.getId(), request, userId);
            }
        } else {
            User newCoachUser = new User();
            String email = request.getEmail() != null ? request.getEmail().trim() : ("coach_" + System.currentTimeMillis() + "@athletehub.local");
            newCoachUser.setEmail(email);
            String fName = request.getFirstName() != null ? request.getFirstName() : "";
            String lName = request.getLastName() != null ? request.getLastName() : "";
            newCoachUser.setFullName((fName + " " + lName).trim().isEmpty() ? "Coach User" : (fName + " " + lName).trim());
            newCoachUser.setPasswordHash("$2b$10$xRmRZT5sbLfAGGa.Xx7paOISqDsFO957eeYuj.DNHng.cDdobKyPW"); // Password123!
            roleRepository.findByName("ROLE_COACH").ifPresent(newCoachUser::setRole);
            newCoachUser.setStatus("Active");
            newCoachUser.setIsVerified(true);
            newCoachUser = userRepository.save(newCoachUser);
            coachUserId = newCoachUser.getId();
        }

        Coach coach = new Coach();
        coach.setUserId(coachUserId);
        coach.setCreatedBy(userId);
        coach.setUpdatedBy(userId);
        
        coachMapper.updateEntityFromRequest(request, coach);
        
        if (request.getOrganizationId() != null) {
            Organization org = organizationRepository.findById(request.getOrganizationId())
                    .orElseThrow(() -> new Exception("Selected organization does not exist."));
            coach.setOrganization(org);
        }

        // First save to generate the ID
        coach = coachRepository.save(coach);

        // Generate coach code using the ID
        coach.setCoachCode(String.format("COA%06d", coach.getId()));

        // Save again with the generated code
        return coachRepository.save(coach);
    }

    @Override
    @Transactional
    public Coach updateCoach(Integer coachId, CoachRequest request, Integer updaterId) throws Exception {
        Coach coach = coachRepository.findById(coachId)
                .orElseThrow(() -> new Exception("Coach not found."));

        if (coach.getStatus() == CoachStatus.DELETED) {
            throw new Exception("Cannot update a deleted coach.");
        }

        coachMapper.updateEntityFromRequest(request, coach);
        
        if (request.getOrganizationId() != null) {
            Organization org = organizationRepository.findById(request.getOrganizationId())
                    .orElseThrow(() -> new Exception("Selected organization does not exist."));
            coach.setOrganization(org);
        }

        coach.setUpdatedBy(updaterId);
        return coachRepository.save(coach);
    }

    @Override
    public Coach getCoachById(Integer id) {
        return coachRepository.findById(id).orElse(null);
    }

    @Override
    public CoachResponse searchCoaches(String search, Integer organizationId, String specialization, String status, int page, int pageSize, String sortBy, String sortDir) {
        return searchCoaches(search, organizationId, null, specialization, status, page, pageSize, sortBy, sortDir);
    }

    @Override
    public CoachResponse searchCoaches(String search, Integer organizationId, Integer sportId, String specialization, String status, int page, int pageSize, String sortBy, String sortDir) {
        Specification<Coach> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.notEqual(root.get("status"), CoachStatus.DELETED));

            if (status != null && !status.isEmpty()) {
                try {
                    predicates.add(cb.equal(root.get("status"), CoachStatus.valueOf(status.toUpperCase())));
                } catch (IllegalArgumentException ignored) {}
            }

            if (organizationId != null) {
                predicates.add(cb.equal(root.get("organizationId"), organizationId));
            }

            if (sportId != null) {
                java.util.Set<Integer> matchingCoachIds = new java.util.HashSet<>();
                // 1. From coach assignments
                coachAssignmentRepository.findAll().stream()
                        .filter(ca -> ca.getStatus() == com.athletehub.api.entity.enums.AssignmentStatus.ACTIVE &&
                                ca.getAthlete() != null &&
                                ca.getAthlete().getSport() != null &&
                                sportId.equals(ca.getAthlete().getSport().getId()) &&
                                ca.getCoach() != null)
                        .forEach(ca -> matchingCoachIds.add(ca.getCoach().getId()));

                // 2. From coach specialization
                sportRepository.findById(sportId).ifPresent(sport -> {
                    String sportName = sport.getName().toLowerCase();
                    coachRepository.findAll().stream()
                            .filter(c -> c.getSpecialization() != null &&
                                    (c.getSpecialization().toLowerCase().contains(sportName) ||
                                     sportName.contains(c.getSpecialization().toLowerCase())))
                            .forEach(c -> matchingCoachIds.add(c.getId()));
                });

                if (matchingCoachIds.isEmpty()) {
                    predicates.add(cb.disjunction());
                } else {
                    predicates.add(root.get("id").in(matchingCoachIds));
                }
            }

            if (specialization != null && !specialization.isEmpty()) {
                predicates.add(cb.like(root.get("specialization"), "%" + specialization + "%"));
            }

            if (search != null && !search.isEmpty()) {
                String likeSearch = "%" + search + "%";
                Join<Coach, Organization> orgJoin = root.join("organization", JoinType.LEFT);
                Join<Coach, User> userJoin = root.join("user", JoinType.INNER);

                predicates.add(cb.or(
                        cb.like(root.get("coachCode"), likeSearch),
                        cb.like(root.get("firstName"), likeSearch),
                        cb.like(root.get("lastName"), likeSearch),
                        cb.like(root.get("email"), likeSearch),
                        cb.like(root.get("phone"), likeSearch),
                        cb.like(root.get("specialization"), likeSearch),
                        cb.like(orgJoin.get("name"), likeSearch),
                        cb.equal(userJoin.get("email"), search)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);

        Page<Coach> paginated = coachRepository.findAll(spec, pageable);

        List<CoachDTO> dtos = paginated.getContent().stream()
                .map(coachMapper::toDto)
                .collect(Collectors.toList());

        return new CoachResponse(dtos, paginated.getTotalElements(), paginated.getTotalPages(), page, pageSize);
    }

    @Override
    @Transactional
    public void softDeleteCoach(Integer id, Integer deleterId) throws Exception {
        Coach coach = coachRepository.findById(id)
                .orElseThrow(() -> new Exception("Coach not found."));
        coach.setStatus(CoachStatus.DELETED);
        coach.setUpdatedBy(deleterId);
        coachRepository.save(coach);
    }

    @Override
    public Map<String, Object> getDashboardStats() {
        Integer userOrgId = tenantSecurityService.isSuperAdmin() ? null : tenantSecurityService.getCurrentUserOrganizationId();

        List<Coach> relevantCoaches;
        if (userOrgId != null) {
            relevantCoaches = coachRepository.findByOrganizationIdAndStatusNot(userOrgId, CoachStatus.DELETED);
        } else {
            relevantCoaches = coachRepository.findAll().stream()
                    .filter(c -> c.getStatus() != CoachStatus.DELETED)
                    .collect(Collectors.toList());
        }

        long activeCoaches = relevantCoaches.stream().filter(c -> c.getStatus() == CoachStatus.ACTIVE).count();
        long inactiveCoaches = relevantCoaches.stream().filter(c -> c.getStatus() == CoachStatus.INACTIVE).count();
        long totalCoaches = activeCoaches + inactiveCoaches;

        double activePercentage = totalCoaches > 0 ? ((double) activeCoaches / totalCoaches) * 100 : 0;
        double inactivePercentage = totalCoaches > 0 ? ((double) inactiveCoaches / totalCoaches) * 100 : 0;

        double avgExperienceActive = relevantCoaches.stream()
                .filter(c -> c.getStatus() == CoachStatus.ACTIVE && c.getExperienceYears() != null)
                .mapToInt(Coach::getExperienceYears)
                .average()
                .orElse(0.0);
        
        List<Map<String, Object>> coachesByOrg = new ArrayList<>();
        if (userOrgId != null) {
            String orgName = organizationRepository.findById(userOrgId).map(Organization::getName).orElse("Unknown");
            Map<String, Object> stat = new HashMap<>();
            stat.put("organizationId", userOrgId);
            stat.put("organizationName", orgName);
            stat.put("count", activeCoaches);
            coachesByOrg.add(stat);
        } else {
            List<Object[]> orgStatsRaw = coachRepository.countCoachesByOrganizationAndStatus(CoachStatus.ACTIVE);
            for (Object[] row : orgStatsRaw) {
                Integer orgId = (Integer) row[0];
                Long count = (Long) row[1];
                String orgName = "Unassigned";
                if (orgId != null) {
                    orgName = organizationRepository.findById(orgId).map(Organization::getName).orElse("Unknown");
                }
                Map<String, Object> stat = new HashMap<>();
                stat.put("organizationId", orgId);
                stat.put("organizationName", orgName);
                stat.put("count", count);
                coachesByOrg.add(stat);
            }
        }
        
        Map<String, Long> specCounts = relevantCoaches.stream()
                .filter(c -> c.getStatus() == CoachStatus.ACTIVE)
                .collect(Collectors.groupingBy(
                        c -> (c.getSpecialization() == null || c.getSpecialization().trim().isEmpty()) ? "Unspecified" : c.getSpecialization(),
                        Collectors.counting()
                ));
        List<Map<String, Object>> coachesBySpec = new ArrayList<>();
        specCounts.forEach((spec, count) -> {
            Map<String, Object> stat = new HashMap<>();
            stat.put("specialization", spec);
            stat.put("count", count);
            coachesBySpec.add(stat);
        });

        // Recently added coaches (last 5 in scope)
        List<CoachDTO> recentlyAdded = relevantCoaches.stream()
                .sorted((a, b) -> {
                    if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .limit(5)
                .map(coachMapper::toDto)
                .collect(Collectors.toList());

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCoaches", totalCoaches);
        stats.put("activeCoaches", activeCoaches);
        stats.put("inactiveCoaches", inactiveCoaches);
        stats.put("activePercentage", activePercentage);
        stats.put("inactivePercentage", inactivePercentage);
        stats.put("averageExperience", avgExperienceActive);
        stats.put("coachesByOrganization", coachesByOrg);
        stats.put("coachesBySpecialization", coachesBySpec);
        stats.put("recentlyAdded", recentlyAdded);

        return stats;
    }

    @Override
    public List<String> validateCoachRequest(CoachRequest request) {
        List<String> errors = new ArrayList<>();

        if (request.getFirstName() == null || request.getFirstName().trim().isEmpty()) errors.add("First name is required.");
        if (request.getLastName() == null || request.getLastName().trim().isEmpty()) errors.add("Last name is required.");
        if (request.getGender() == null || request.getGender().trim().isEmpty()) {
            errors.add("Gender is required.");
        } else {
            try {
                Gender.valueOf(request.getGender().toUpperCase());
            } catch (IllegalArgumentException e) {
                errors.add("Invalid gender.");
            }
        }
        if (request.getDateOfBirth() == null) errors.add("Date of birth is required.");
        else if (request.getDateOfBirth().isAfter(LocalDate.now())) errors.add("Date of birth cannot be in the future.");

        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            if (!request.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                errors.add("Invalid email format.");
            }
        }
        
        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            String cleanPhone = request.getPhone().replaceAll("[\\s-]", "");
            if (!cleanPhone.matches("^\\+?[0-9]{7,15}$")) {
                errors.add("Invalid phone number format.");
            }
        }

        if (request.getExperienceYears() != null && request.getExperienceYears() < 0) {
            errors.add("Experience years cannot be negative.");
        }
        
        if (request.getOrganizationId() != null) {
            if (!organizationRepository.existsById(request.getOrganizationId())) {
                errors.add("Selected organization does not exist.");
            }
        }

        return errors;
    }
}
