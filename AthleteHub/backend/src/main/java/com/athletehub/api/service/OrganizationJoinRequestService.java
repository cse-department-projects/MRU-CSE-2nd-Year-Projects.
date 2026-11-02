package com.athletehub.api.service;

import com.athletehub.api.entity.Athlete;
import com.athletehub.api.entity.Coach;
import com.athletehub.api.entity.CoachAssignment;
import com.athletehub.api.entity.Organization;
import com.athletehub.api.entity.OrganizationJoinRequest;
import com.athletehub.api.entity.Sport;
import com.athletehub.api.entity.User;
import com.athletehub.api.entity.enums.AssignmentStatus;
import com.athletehub.api.entity.enums.CoachStatus;
import com.athletehub.api.entity.enums.Gender;
import com.athletehub.api.repository.AthleteRepository;
import com.athletehub.api.repository.CoachAssignmentRepository;
import com.athletehub.api.repository.CoachRepository;
import com.athletehub.api.repository.OrganizationJoinRequestRepository;
import com.athletehub.api.repository.OrganizationRepository;
import com.athletehub.api.repository.SportRepository;
import com.athletehub.api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrganizationJoinRequestService {

    private final OrganizationJoinRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final CoachRepository coachRepository;
    private final AthleteRepository athleteRepository;
    private final CoachAssignmentRepository coachAssignmentRepository;
    private final SportRepository sportRepository;

    public OrganizationJoinRequestService(OrganizationJoinRequestRepository requestRepository,
                                          UserRepository userRepository,
                                          OrganizationRepository organizationRepository,
                                          CoachRepository coachRepository,
                                          AthleteRepository athleteRepository,
                                          CoachAssignmentRepository coachAssignmentRepository,
                                          SportRepository sportRepository) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.coachRepository = coachRepository;
        this.athleteRepository = athleteRepository;
        this.coachAssignmentRepository = coachAssignmentRepository;
        this.sportRepository = sportRepository;
    }

    @Transactional
    public OrganizationJoinRequest submitAthleteRequest(Integer userId, Integer organizationId, Integer sportId,
                                                        Integer preferredCoachId, String specialization,
                                                        String message, String phone) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        if (phone != null && !phone.isBlank()) {
            user.setPhone(phone.trim());
            userRepository.save(user);
        }

        if (user.getOrganization() != null) {
            throw new IllegalStateException("You are already affiliated with an organization (" + user.getOrganization().getName() + ").");
        }

        Optional<OrganizationJoinRequest> existingPending = requestRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(userId, "PENDING");
        if (existingPending.isPresent()) {
            throw new IllegalStateException("You already have a pending join request to " + existingPending.get().getOrganization().getName() + ".");
        }

        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Target organization not found."));

        if ("Deleted".equalsIgnoreCase(org.getStatus()) || "Inactive".equalsIgnoreCase(org.getStatus())) {
            throw new IllegalStateException("Selected organization is not accepting membership requests.");
        }

        if (preferredCoachId != null) {
            Coach coach = coachRepository.findById(preferredCoachId)
                    .orElseThrow(() -> new IllegalArgumentException("Selected preferred coach not found."));
            if (!organizationId.equals(coach.getOrganizationId())) {
                throw new IllegalArgumentException("Selected coach does not belong to the target organization.");
            }
        }

        if (sportId != null && !sportRepository.existsById(sportId)) {
            throw new IllegalArgumentException("Selected sport does not exist.");
        }

        OrganizationJoinRequest req = new OrganizationJoinRequest();
        req.setUserId(userId);
        req.setOrganizationId(organizationId);
        req.setRole("ROLE_ATHLETE");
        req.setSportId(sportId);
        req.setPreferredCoachId(preferredCoachId);
        req.setSpecialization(specialization);
        req.setMessage(message);
        req.setStatus("PENDING");

        return requestRepository.save(req);
    }

    @Transactional
    public Map<String, Object> joinByOrganizationCode(Integer userId, String orgCode) throws Exception {
        if (orgCode == null || orgCode.trim().isEmpty()) {
            throw new IllegalArgumentException("Organization code is required.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        if (user.getOrganization() != null) {
            throw new IllegalStateException("You are already affiliated with " + user.getOrganization().getName() + ".");
        }

        Organization foundOrg = organizationRepository.findByOrganizationCode(orgCode.trim().toUpperCase());
        if (foundOrg == null) {
            // Also try exact string match
            foundOrg = organizationRepository.findByOrganizationCode(orgCode.trim());
        }
        if (foundOrg == null || "Deleted".equalsIgnoreCase(foundOrg.getStatus())) {
            throw new IllegalArgumentException("Invalid organization code. Organization not found.");
        }
        final Organization org = foundOrg;

        // Affiliate user
        user.setOrganization(org);
        userRepository.save(user);

        // Cancel any pending request
        requestRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(userId, "PENDING")
                .ifPresent(p -> {
                    p.setStatus("CANCELLED");
                    p.setRejectionReason("Joined directly via Organization Code: " + org.getOrganizationCode());
                    requestRepository.save(p);
                });

        // If Athlete, update athlete profile
        Athlete athlete = athleteRepository.findByUserId(userId);
        if (athlete != null) {
            athlete.setOrganizationId(org.getId());
            athleteRepository.save(athlete);
        }

        // If Coach, update coach profile
        Coach coach = coachRepository.findByUserId(userId);
        if (coach != null) {
            coach.setOrganizationId(org.getId());
            coach.setStatus(CoachStatus.ACTIVE);
            coachRepository.save(coach);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("organizationId", org.getId());
        result.put("organizationName", org.getName());
        result.put("organizationCode", org.getOrganizationCode());
        result.put("message", "Successfully joined " + org.getName() + "!");
        return result;
    }

    @Transactional
    public OrganizationJoinRequest submitCoachRequest(Integer userId, Integer organizationId, String specialization, Integer experienceYears, String qualification, String message, String phone) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        if (phone != null && !phone.isBlank()) {
            user.setPhone(phone.trim());
            userRepository.save(user);
        }

        if (user.getOrganization() != null) {
            throw new IllegalStateException("You are already affiliated with an organization (" + user.getOrganization().getName() + ").");
        }

        Optional<OrganizationJoinRequest> existingPending = requestRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(userId, "PENDING");
        if (existingPending.isPresent()) {
            throw new IllegalStateException("You already have a pending join request to " + existingPending.get().getOrganization().getName() + ".");
        }

        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Target organization not found."));

        if ("Deleted".equalsIgnoreCase(org.getStatus())) {
            throw new IllegalStateException("Selected organization is inactive.");
        }

        OrganizationJoinRequest req = new OrganizationJoinRequest();
        req.setUserId(userId);
        req.setOrganizationId(organizationId);
        req.setRole(user.getRole() != null ? user.getRole().getName() : "ROLE_COACH");
        req.setSpecialization(specialization);
        req.setExperienceYears(experienceYears != null ? experienceYears : 0);
        req.setQualification(qualification);
        req.setMessage(message);
        req.setStatus("PENDING");

        return requestRepository.save(req);
    }

    public List<Map<String, Object>> getMyRequests(Integer userId) {
        return requestRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getMyActivePendingRequest(Integer userId) {
        return requestRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(userId, "PENDING")
                .map(this::mapToDto)
                .orElse(null);
    }

    @Transactional
    public void cancelMyRequest(Integer userId, Integer requestId) {
        OrganizationJoinRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found."));
        if (!req.getUserId().equals(userId)) {
            throw new SecurityException("Unauthorized to cancel this request.");
        }
        if (!"PENDING".equals(req.getStatus())) {
            throw new IllegalStateException("Only pending requests can be cancelled.");
        }
        req.setStatus("CANCELLED");
        requestRepository.save(req);
    }

    public List<Map<String, Object>> getOrganizationRequests(Integer organizationId, String status) {
        List<OrganizationJoinRequest> list;
        if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status.trim())) {
            list = requestRepository.findByOrganizationIdAndStatusOrderByCreatedAtDesc(organizationId, status.trim().toUpperCase());
        } else {
            list = requestRepository.findByOrganizationIdOrderByCreatedAtDesc(organizationId);
        }
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> approveRequest(Integer requestId, Integer reviewerUserId) throws Exception {
        OrganizationJoinRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found."));

        if (!"PENDING".equals(req.getStatus())) {
            throw new IllegalStateException("This request is no longer pending (Current: " + req.getStatus() + ").");
        }

        Organization org = req.getOrganization();
        User user = req.getUser();

        req.setStatus("APPROVED");
        req.setReviewedBy(reviewerUserId);
        req.setReviewedAt(LocalDateTime.now());
        requestRepository.save(req);

        // Bind user to organization
        user.setOrganization(org);
        userRepository.save(user);

        if ("ROLE_ATHLETE".equalsIgnoreCase(req.getRole())) {
            // Provision / activate athlete profile
            Athlete athlete = athleteRepository.findByUserId(user.getId());
            if (athlete == null) {
                athlete = new Athlete();
                athlete.setUserId(user.getId());
                Integer lastId = athleteRepository.findLastInsertedId();
                int nextSeq = (lastId != null ? lastId : 0) + 1;
                athlete.setAthleteCode(String.format("ATH%06d", nextSeq));

                String fullName = user.getFullName() != null ? user.getFullName().trim() : "Athlete";
                String[] parts = fullName.split("\\s+", 2);
                athlete.setFirstName(parts[0]);
                athlete.setLastName(parts.length > 1 ? parts[1] : "");
                athlete.setGender("Male");
                athlete.setDateOfBirth(LocalDate.now().minusYears(18));
            }

            athlete.setOrganizationId(org.getId());
            athlete.setStatus("Active");
            if (req.getSportId() != null) {
                sportRepository.findById(req.getSportId()).ifPresent(athlete::setSport);
            }
            if (req.getSpecialization() != null && !req.getSpecialization().isBlank()) {
                athlete.setCompetitionRole(req.getSpecialization());
            }
            if (user.getPhone() != null && !user.getPhone().isBlank()) {
                athlete.setPhone(user.getPhone());
            }
            athlete = athleteRepository.save(athlete);

            // If a preferred coach was selected, automatically create CoachAssignment!
            if (req.getPreferredCoachId() != null) {
                Optional<Coach> coachOpt = coachRepository.findById(req.getPreferredCoachId());
                if (coachOpt.isPresent() && org.getId().equals(coachOpt.get().getOrganizationId())) {
                    boolean alreadyAssigned = coachAssignmentRepository.existsByCoachIdAndAthleteIdAndStatus(
                            coachOpt.get().getId(), athlete.getId(), AssignmentStatus.ACTIVE);
                    if (!alreadyAssigned) {
                        CoachAssignment assignment = new CoachAssignment();
                        assignment.setCoach(coachOpt.get());
                        assignment.setAthlete(athlete);
                        assignment.setOrganization(org);
                        assignment.setStartDate(LocalDate.now());
                        assignment.setStatus(AssignmentStatus.ACTIVE);
                        assignment.setRemarks("Assigned upon Organization Join Request approval (preferred coach selection).");
                        assignment.setCreatedBy(reviewerUserId);
                        assignment.setAssignmentCode(String.format("ASG%05d", (int)(System.currentTimeMillis() % 100000)));
                        coachAssignmentRepository.save(assignment);
                    }
                }
            }
        } else {
            // Provision / activate coach profile
            Coach existingCoach = coachRepository.findByUserId(user.getId());
            if (existingCoach != null) {
                existingCoach.setOrganizationId(org.getId());
                existingCoach.setStatus(CoachStatus.ACTIVE);
                if (req.getSpecialization() != null) existingCoach.setSpecialization(req.getSpecialization());
                if (req.getExperienceYears() != null) existingCoach.setExperienceYears(req.getExperienceYears());
                if (req.getQualification() != null) existingCoach.setQualification(req.getQualification());
                if (user.getPhone() != null && !user.getPhone().isBlank()) existingCoach.setPhone(user.getPhone());
                coachRepository.save(existingCoach);
            } else {
                Coach newCoach = new Coach();
                newCoach.setUserId(user.getId());

                String fullName = user.getFullName() != null ? user.getFullName().trim() : "Coach";
                String[] parts = fullName.split("\\s+", 2);
                newCoach.setFirstName(parts[0]);
                newCoach.setLastName(parts.length > 1 ? parts[1] : "");

                newCoach.setEmail(user.getEmail());
                newCoach.setPhone(user.getPhone());
                newCoach.setOrganizationId(org.getId());
                newCoach.setSpecialization(req.getSpecialization() != null ? req.getSpecialization() : "General Athletics");
                newCoach.setExperienceYears(req.getExperienceYears() != null ? req.getExperienceYears() : 1);
                newCoach.setQualification(req.getQualification());
                newCoach.setGender(Gender.MALE);
                newCoach.setDateOfBirth(LocalDate.now().minusYears(30));
                newCoach.setStatus(CoachStatus.ACTIVE);

                Integer lastId = coachRepository.findLastInsertedId();
                int nextSeq = (lastId != null ? lastId : 0) + 1;
                newCoach.setCoachCode(String.format("COA%04d", nextSeq));

                coachRepository.save(newCoach);
            }
        }

        return mapToDto(req);
    }

    @Transactional
    public Map<String, Object> rejectRequest(Integer requestId, Integer reviewerUserId, String reason) {
        OrganizationJoinRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found."));

        if (!"PENDING".equals(req.getStatus())) {
            throw new IllegalStateException("This request is no longer pending.");
        }

        req.setStatus("REJECTED");
        req.setRejectionReason(reason);
        req.setReviewedBy(reviewerUserId);
        req.setReviewedAt(LocalDateTime.now());
        return mapToDto(requestRepository.save(req));
    }

    private Map<String, Object> mapToDto(OrganizationJoinRequest req) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", req.getId());
        dto.put("userId", req.getUserId());
        dto.put("organizationId", req.getOrganizationId());
        dto.put("role", req.getRole());
        dto.put("specialization", req.getSpecialization());
        dto.put("experienceYears", req.getExperienceYears());
        dto.put("qualification", req.getQualification());
        dto.put("message", req.getMessage());
        dto.put("status", req.getStatus());
        dto.put("rejectionReason", req.getRejectionReason());
        dto.put("createdAt", req.getCreatedAt());
        dto.put("reviewedAt", req.getReviewedAt());

        dto.put("sportId", req.getSportId());
        dto.put("sportName", req.getSport() != null ? req.getSport().getName() : null);
        dto.put("preferredCoachId", req.getPreferredCoachId());
        if (req.getPreferredCoach() != null) {
            dto.put("preferredCoachName", req.getPreferredCoach().getFirstName() + " " + req.getPreferredCoach().getLastName());
            dto.put("preferredCoachSpecialization", req.getPreferredCoach().getSpecialization());
        }

        if (req.getUser() != null) {
            Map<String, Object> u = new HashMap<>();
            u.put("id", req.getUser().getId());
            u.put("fullName", req.getUser().getFullName());
            u.put("email", req.getUser().getEmail());
            u.put("phone", req.getUser().getPhone());
            dto.put("user", u);
        }

        // If user is an athlete, attach their athletic vitals
        Athlete athlete = athleteRepository.findByUserId(req.getUserId());
        if (athlete != null) {
            Map<String, Object> athMap = new HashMap<>();
            athMap.put("id", athlete.getId());
            athMap.put("height", athlete.getHeight());
            athMap.put("weight", athlete.getWeight());
            athMap.put("gender", athlete.getGender());
            athMap.put("dateOfBirth", athlete.getDateOfBirth());
            athMap.put("athleteCode", athlete.getAthleteCode());
            athMap.put("medicalStatus", athlete.getMedicalStatus());
            athMap.put("competitionRole", athlete.getCompetitionRole());
            athMap.put("sportName", athlete.getSport() != null ? athlete.getSport().getName() : null);
            dto.put("athleteVitals", athMap);
        }

        if (req.getOrganization() != null) {
            Map<String, Object> o = new HashMap<>();
            o.put("id", req.getOrganization().getId());
            o.put("name", req.getOrganization().getName());
            o.put("organizationCode", req.getOrganization().getOrganizationCode());
            o.put("city", req.getOrganization().getCity());
            o.put("country", req.getOrganization().getCountry());
            dto.put("organization", o);
        }

        return dto;
    }
}
