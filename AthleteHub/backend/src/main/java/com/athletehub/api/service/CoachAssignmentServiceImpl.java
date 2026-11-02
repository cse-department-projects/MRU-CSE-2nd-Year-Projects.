package com.athletehub.api.service;

import com.athletehub.api.dto.CoachAssignmentDTO;
import com.athletehub.api.dto.CoachAssignmentMapper;
import com.athletehub.api.dto.CoachAssignmentRequest;
import com.athletehub.api.dto.CoachAssignmentResponse;
import com.athletehub.api.entity.Athlete;
import com.athletehub.api.entity.Coach;
import com.athletehub.api.entity.CoachAssignment;
import com.athletehub.api.entity.Organization;
import com.athletehub.api.entity.enums.AssignmentStatus;
import com.athletehub.api.entity.enums.CoachStatus;
import com.athletehub.api.repository.AthleteRepository;
import com.athletehub.api.repository.CoachAssignmentRepository;
import com.athletehub.api.repository.CoachRepository;
import com.athletehub.api.repository.OrganizationRepository;
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
public class CoachAssignmentServiceImpl implements CoachAssignmentService {

    private final CoachAssignmentRepository assignmentRepository;
    private final CoachRepository coachRepository;
    private final AthleteRepository athleteRepository;
    private final OrganizationRepository organizationRepository;
    private final CoachAssignmentMapper mapper;

    public CoachAssignmentServiceImpl(CoachAssignmentRepository assignmentRepository, CoachRepository coachRepository, AthleteRepository athleteRepository, OrganizationRepository organizationRepository, CoachAssignmentMapper mapper) {
        this.assignmentRepository = assignmentRepository;
        this.coachRepository = coachRepository;
        this.athleteRepository = athleteRepository;
        this.organizationRepository = organizationRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public CoachAssignment createAssignment(Integer userId, CoachAssignmentRequest request) throws Exception {
        Coach coach = coachRepository.findById(request.getCoachId())
                .orElseThrow(() -> new Exception("Coach not found."));
        
        Athlete athlete = athleteRepository.findById(request.getAthleteId())
                .orElseThrow(() -> new Exception("Athlete not found."));
                
        Organization org = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new Exception("Organization not found."));

        if (coach.getStatus() != CoachStatus.ACTIVE) {
            throw new Exception("Coach must be ACTIVE to be assigned.");
        }

        if (!"Active".equalsIgnoreCase(athlete.getStatus())) {
            throw new Exception("Athlete must be ACTIVE to be assigned.");
        }

        if (!coach.getOrganizationId().equals(org.getId()) || !athlete.getOrganizationId().equals(org.getId())) {
            throw new Exception("Coach and Athlete must belong to the selected Organization.");
        }

        if (coach.getUserId().equals(athlete.getUserId())) {
            throw new Exception("A coach cannot be assigned to themselves.");
        }

        boolean exists = assignmentRepository.existsByCoachIdAndAthleteIdAndStatus(coach.getId(), athlete.getId(), AssignmentStatus.ACTIVE);
        if (exists && (request.getStatus() == null || AssignmentStatus.ACTIVE.name().equals(request.getStatus().toUpperCase()))) {
            throw new Exception("An ACTIVE assignment already exists for this Coach and Athlete.");
        }

        CoachAssignment assignment = new CoachAssignment();
        assignment.setCoach(coach);
        assignment.setAthlete(athlete);
        assignment.setOrganization(org);
        assignment.setStartDate(request.getStartDate());
        assignment.setEndDate(request.getEndDate());
        
        if (request.getStatus() != null) {
            assignment.setStatus(AssignmentStatus.valueOf(request.getStatus().toUpperCase()));
        }
        
        assignment.setRemarks(request.getRemarks());
        assignment.setCreatedBy(userId);
        assignment.setUpdatedBy(userId);

        // Save to generate ID
        assignment = assignmentRepository.save(assignment);
        
        // Generate and set code
        assignment.setAssignmentCode(String.format("CAS%06d", assignment.getId()));
        
        return assignmentRepository.save(assignment);
    }

    @Override
    @Transactional
    public CoachAssignment updateAssignment(Integer id, CoachAssignmentRequest request, Integer updaterId, boolean isSuperAdmin) throws Exception {
        CoachAssignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new Exception("Assignment not found."));

        if (assignment.getStatus() == AssignmentStatus.CANCELLED && !isSuperAdmin) {
            throw new Exception("Cancelled assignments cannot be edited except by administrators.");
        }

        if (assignment.getStatus() == AssignmentStatus.COMPLETED) {
            // Read-only except for remarks
            assignment.setRemarks(request.getRemarks());
            assignment.setUpdatedBy(updaterId);
            return assignmentRepository.save(assignment);
        }

        // Allow status updates and end dates for active assignments
        if (request.getStatus() != null) {
            AssignmentStatus newStatus = AssignmentStatus.valueOf(request.getStatus().toUpperCase());
            assignment.setStatus(newStatus);
        }
        
        if (request.getEndDate() != null) {
            if (request.getEndDate().isBefore(assignment.getStartDate())) {
                throw new Exception("End Date cannot be before Start Date.");
            }
            assignment.setEndDate(request.getEndDate());
        }

        if (request.getRemarks() != null) {
            assignment.setRemarks(request.getRemarks());
        }

        assignment.setUpdatedBy(updaterId);
        return assignmentRepository.save(assignment);
    }

    @Override
    public CoachAssignment getAssignmentById(Integer id) {
        return assignmentRepository.findById(id).orElse(null);
    }

    @Override
    public CoachAssignmentResponse searchAssignments(String search, Integer organizationId, Integer coachId, Integer athleteId, String status, LocalDate startDate, LocalDate endDate, int page, int pageSize, String sortBy, String sortDir) {
        Specification<CoachAssignment> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (organizationId != null) {
                predicates.add(cb.equal(root.get("organization").get("id"), organizationId));
            }
            if (coachId != null) {
                predicates.add(cb.equal(root.get("coach").get("id"), coachId));
            }
            if (athleteId != null) {
                predicates.add(cb.equal(root.get("athlete").get("id"), athleteId));
            }
            if (status != null && !status.isEmpty()) {
                try {
                    predicates.add(cb.equal(root.get("status"), AssignmentStatus.valueOf(status.toUpperCase())));
                } catch (IllegalArgumentException ignored) {}
            }
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("startDate"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("endDate"), endDate));
            }

            if (search != null && !search.trim().isEmpty()) {
                String likeSearch = "%" + search + "%";
                Join<CoachAssignment, Coach> coachJoin = root.join("coach", JoinType.INNER);
                Join<CoachAssignment, Athlete> athleteJoin = root.join("athlete", JoinType.INNER);
                Join<CoachAssignment, Organization> orgJoin = root.join("organization", JoinType.INNER);

                predicates.add(cb.or(
                        cb.like(root.get("assignmentCode"), likeSearch),
                        cb.like(coachJoin.get("coachCode"), likeSearch),
                        cb.like(coachJoin.get("firstName"), likeSearch),
                        cb.like(coachJoin.get("lastName"), likeSearch),
                        cb.like(athleteJoin.get("athleteCode"), likeSearch),
                        cb.like(athleteJoin.get("firstName"), likeSearch),
                        cb.like(athleteJoin.get("lastName"), likeSearch),
                        cb.like(orgJoin.get("name"), likeSearch)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);

        Page<CoachAssignment> paginated = assignmentRepository.findAll(spec, pageable);

        List<CoachAssignmentDTO> dtos = paginated.getContent().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());

        return new CoachAssignmentResponse(dtos, paginated.getTotalElements(), paginated.getTotalPages(), page, pageSize);
    }

    @Override
    @Transactional
    public void deleteAssignment(Integer id, Integer deleterId) throws Exception {
        CoachAssignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new Exception("Assignment not found."));
        
        // Soft delete equivalent for assignments is CANCELLED status.
        // We never physically delete.
        assignment.setStatus(AssignmentStatus.CANCELLED);
        assignment.setUpdatedBy(deleterId);
        assignmentRepository.save(assignment);
    }

    @Override
    public Map<String, Object> getDashboardStats() {
        long totalAssignments = assignmentRepository.count();
        long activeAssignments = assignmentRepository.countByStatus(AssignmentStatus.ACTIVE);
        long completedAssignments = assignmentRepository.countByStatus(AssignmentStatus.COMPLETED);
        long cancelledAssignments = assignmentRepository.countByStatus(AssignmentStatus.CANCELLED);

        // Coaches without athletes: Total active coaches - Coaches with active assignments
        long totalActiveCoaches = coachRepository.countByStatus(CoachStatus.ACTIVE);
        long coachesWithActiveAssignments = assignmentRepository.countDistinctCoachesByStatus(AssignmentStatus.ACTIVE);
        long coachesWithoutAthletes = totalActiveCoaches - coachesWithActiveAssignments;

        // Unassigned athletes: Total active athletes - Athletes with active assignments
        long totalActiveAthletes = athleteRepository.countByStatusNot("Deleted"); // simplified approximation
        long athletesWithActiveAssignments = assignmentRepository.countDistinctAthletesByStatus(AssignmentStatus.ACTIVE);
        long unassignedAthletes = totalActiveAthletes - athletesWithActiveAssignments;
        
        // Prevent negative values if data is inconsistent
        if (coachesWithoutAthletes < 0) coachesWithoutAthletes = 0;
        if (unassignedAthletes < 0) unassignedAthletes = 0;

        double avgAthletesPerCoach = coachesWithActiveAssignments > 0 
            ? (double) activeAssignments / coachesWithActiveAssignments 
            : 0;

        Pageable topFive = PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<CoachAssignmentDTO> recentAssignments = assignmentRepository.findAll(topFive).getContent().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAssignments", totalAssignments);
        stats.put("activeAssignments", activeAssignments);
        stats.put("completedAssignments", completedAssignments);
        stats.put("cancelledAssignments", cancelledAssignments);
        stats.put("unassignedAthletes", unassignedAthletes);
        stats.put("coachesWithoutAthletes", coachesWithoutAthletes);
        stats.put("averageAthletesPerCoach", avgAthletesPerCoach);
        stats.put("recentAssignments", recentAssignments);

        return stats;
    }

    @Override
    public List<String> validateAssignmentRequest(CoachAssignmentRequest request) {
        List<String> errors = new ArrayList<>();
        if (request.getCoachId() == null) errors.add("Coach ID is required.");
        if (request.getAthleteId() == null) errors.add("Athlete ID is required.");
        if (request.getOrganizationId() == null) errors.add("Organization ID is required.");
        if (request.getStartDate() == null) errors.add("Start Date is required.");
        
        if (request.getEndDate() != null && request.getStartDate() != null) {
            if (request.getEndDate().isBefore(request.getStartDate())) {
                errors.add("End Date cannot be before Start Date.");
            }
        }
        
        if (request.getStatus() != null) {
            try {
                AssignmentStatus.valueOf(request.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                errors.add("Invalid status.");
            }
        }
        
        return errors;
    }

    @Override
    public List<CoachAssignment> getAssignmentsByCoach(Integer coachId) {
        return assignmentRepository.findByCoachId(coachId);
    }

    @Override
    public List<CoachAssignment> getAssignmentsByAthlete(Integer athleteId) {
        return assignmentRepository.findByAthleteId(athleteId);
    }
}
