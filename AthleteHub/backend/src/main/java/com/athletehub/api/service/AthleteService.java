package com.athletehub.api.service;

import com.athletehub.api.dto.AthleteRequestDTO;
import com.athletehub.api.dto.AthleteResponseDTO;
import com.athletehub.api.dto.SportDTO;
import com.athletehub.api.entity.Athlete;
import com.athletehub.api.entity.CoachAssignment;
import com.athletehub.api.entity.enums.AssignmentStatus;
import com.athletehub.api.repository.AthleteRepository;
import com.athletehub.api.repository.CoachAssignmentRepository;
import com.athletehub.api.repository.OrganizationRepository;
import com.athletehub.api.repository.SportRepository;
import com.athletehub.api.repository.TeamMemberRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AthleteService {

    private final AthleteRepository athleteRepository;
    private final SportRepository sportRepository;
    private final OrganizationRepository organizationRepository;
    private final CoachAssignmentRepository coachAssignmentRepository;
    private final TeamMemberRepository teamMemberRepository;

    private static final Map<String, Integer> PROFILE_WEIGHTS = Map.ofEntries(
        Map.entry("first_name", 5),
        Map.entry("last_name", 5),
        Map.entry("date_of_birth", 10),
        Map.entry("gender", 5),
        Map.entry("blood_group", 5),
        Map.entry("phone", 10),
        Map.entry("address", 5),
        Map.entry("city", 5),
        Map.entry("state", 5),
        Map.entry("country", 5),
        Map.entry("emergency_contact_name", 10),
        Map.entry("emergency_contact_number", 10),
        Map.entry("height", 5),
        Map.entry("weight", 5),
        Map.entry("sport_id", 5),
        Map.entry("profile_photo_url", 5)
    );

    public AthleteService(AthleteRepository athleteRepository, SportRepository sportRepository,
                          OrganizationRepository organizationRepository,
                          CoachAssignmentRepository coachAssignmentRepository,
                          TeamMemberRepository teamMemberRepository) {
        this.athleteRepository = athleteRepository;
        this.sportRepository = sportRepository;
        this.organizationRepository = organizationRepository;
        this.coachAssignmentRepository = coachAssignmentRepository;
        this.teamMemberRepository = teamMemberRepository;
    }

    public synchronized String generateAthleteCode() {
        Integer lastId = athleteRepository.findLastInsertedId();
        if (lastId == null) {
            return "ATH000001";
        }
        return String.format("ATH%06d", lastId + 1);
    }

    public int calculateProfileCompletion(Athlete athlete) {
        if (athlete == null) return 0;
        int score = 0;
        int totalWeight = PROFILE_WEIGHTS.values().stream().mapToInt(Integer::intValue).sum();

        if (isTruthy(athlete.getFirstName())) score += PROFILE_WEIGHTS.get("first_name");
        if (athlete.getDateOfBirth() != null) score += PROFILE_WEIGHTS.get("date_of_birth");
        if (isTruthy(athlete.getLastName())) score += PROFILE_WEIGHTS.get("last_name");
        if (isTruthy(athlete.getGender())) score += PROFILE_WEIGHTS.get("gender");
        if (isTruthy(athlete.getBloodGroup())) score += PROFILE_WEIGHTS.get("blood_group");
        if (isTruthy(athlete.getPhone())) score += PROFILE_WEIGHTS.get("phone");
        if (isTruthy(athlete.getAddress())) score += PROFILE_WEIGHTS.get("address");
        if (isTruthy(athlete.getCity())) score += PROFILE_WEIGHTS.get("city");
        if (isTruthy(athlete.getState())) score += PROFILE_WEIGHTS.get("state");
        if (isTruthy(athlete.getCountry())) score += PROFILE_WEIGHTS.get("country");
        if (isTruthy(athlete.getEmergencyContactName())) score += PROFILE_WEIGHTS.get("emergency_contact_name");
        if (isTruthy(athlete.getEmergencyContactNumber())) score += PROFILE_WEIGHTS.get("emergency_contact_number");
        if (athlete.getHeight() != null) score += PROFILE_WEIGHTS.get("height");
        if (athlete.getWeight() != null) score += PROFILE_WEIGHTS.get("weight");
        if (athlete.getSport() != null) score += PROFILE_WEIGHTS.get("sport_id");
        if (isTruthy(athlete.getProfilePhotoUrl())) score += PROFILE_WEIGHTS.get("profile_photo_url");

        return (int) (((double) score / totalWeight) * 100);
    }

    private boolean isTruthy(String val) {
        return val != null && !val.trim().isEmpty();
    }

    public AthleteResponseDTO getAthleteDetails(Athlete athlete) {
        AthleteResponseDTO dto = new AthleteResponseDTO();
        dto.setId(athlete.getId());
        dto.setUserId(athlete.getUserId());
        dto.setAthleteCode(athlete.getAthleteCode());
        dto.setFirstName(athlete.getFirstName());
        dto.setLastName(athlete.getLastName());
        
        // Derived Fields
        String fullName = athlete.getFirstName();
        if (athlete.getLastName() != null) {
            fullName += " " + athlete.getLastName();
        }
        dto.setFullName(fullName.trim());
        
        dto.setDateOfBirth(athlete.getDateOfBirth());
        if (athlete.getDateOfBirth() != null) {
            dto.setAge(Period.between(athlete.getDateOfBirth(), LocalDate.now()).getYears());
        }

        dto.setGender(athlete.getGender());
        dto.setBloodGroup(athlete.getBloodGroup());
        dto.setPhone(athlete.getPhone());
        
        if (athlete.getUser() != null) {
            dto.setEmail(athlete.getUser().getEmail());
        }

        dto.setAddress(athlete.getAddress());
        dto.setCity(athlete.getCity());
        dto.setState(athlete.getState());
        dto.setCountry(athlete.getCountry());
        dto.setEmergencyContactName(athlete.getEmergencyContactName());
        dto.setEmergencyContactNumber(athlete.getEmergencyContactNumber());
        dto.setHeight(athlete.getHeight());
        dto.setWeight(athlete.getWeight());
        dto.setProfilePhotoUrl(athlete.getProfilePhotoUrl());
        
        if (athlete.getSport() != null) {
            dto.setSport(new SportDTO(athlete.getSport().getId(), athlete.getSport().getName()));
        }

        dto.setOrganizationId(athlete.getOrganizationId());
        if (athlete.getOrganizationId() != null) {
            organizationRepository.findById(athlete.getOrganizationId())
                    .ifPresent(organization -> dto.setOrganizationName(organization.getName()));
        }

        coachAssignmentRepository.findByAthleteId(athlete.getId()).stream()
                .filter(assignment -> assignment.getStatus() == AssignmentStatus.ACTIVE)
                .findFirst()
                .ifPresent(assignment -> dto.setAssignedCoachName(
                        assignment.getCoach().getFirstName() + " " + assignment.getCoach().getLastName()));

        teamMemberRepository.findActiveMembershipsByAthleteId(athlete.getId()).stream()
                .findFirst()
                .ifPresent(tm -> {
                    if (tm.getTeam() != null) {
                        dto.setAssignedTeamId(tm.getTeam().getId());
                        dto.setAssignedTeamName(tm.getTeam().getName());
                    }
                });

        dto.setStatus(athlete.getStatus());
        dto.setMedicalStatus(athlete.getMedicalStatus());
        dto.setPerformanceRating(athlete.getPerformanceRating());
        dto.setNotes(athlete.getNotes());
        
        dto.setInjuries(athlete.getInjuries() != null ? new ArrayList<>(athlete.getInjuries()) : new ArrayList<>());
        dto.setAchievements(athlete.getAchievements() != null ? new ArrayList<>(athlete.getAchievements()) : new ArrayList<>());

        dto.setProfileCompletion(calculateProfileCompletion(athlete));
        dto.setCreatedAt(athlete.getCreatedAt());
        dto.setUpdatedAt(athlete.getUpdatedAt());

        return dto;
    }

    public List<String> validateAthleteData(AthleteRequestDTO dto) {
        List<String> errors = new ArrayList<>();

        if (!isTruthy(dto.getFirstName())) errors.add("Missing required field: first_name");
        if (!isTruthy(dto.getLastName())) errors.add("Missing required field: last_name");
        if (dto.getDateOfBirth() == null) errors.add("Missing required field: date_of_birth");
        if (!isTruthy(dto.getGender())) errors.add("Missing required field: gender");
        if (dto.getSportId() == null) errors.add("Missing required field: sport_id");

        if (dto.getDateOfBirth() != null) {
            if (dto.getDateOfBirth().isAfter(LocalDate.now()) || dto.getDateOfBirth().isEqual(LocalDate.now())) {
                errors.add("Date of birth cannot be in the future.");
            }
        }

        if (dto.getSportId() != null) {
            if (!sportRepository.existsById(dto.getSportId())) {
                errors.add("Selected sport does not exist.");
            }
        }

        if (dto.getHeight() != null) {
            if (dto.getHeight() <= 0 || dto.getHeight() > 300) {
                errors.add("Height must be a positive value within reasonable range (0-300 cm).");
            }
        }

        if (dto.getWeight() != null) {
            if (dto.getWeight() <= 0 || dto.getWeight() > 500) {
                errors.add("Weight must be a positive value within reasonable range (0-500 kg).");
            }
        }

        return errors;
    }

    @Transactional
    public Athlete createAthlete(Integer userId, AthleteRequestDTO dto) throws Exception {
        return createAthlete(userId, userId, dto);
    }

    @Transactional
    public Athlete createAthlete(Integer athleteUserId, Integer creatorId, AthleteRequestDTO dto) throws Exception {
        if (athleteUserId != null) {
            Athlete existing = athleteRepository.findByUserId(athleteUserId);
            if (existing != null) {
                return updateAthlete(existing, dto, creatorId);
            }
        }

        Athlete athlete = new Athlete();
        athlete.setUserId(athleteUserId);
        athlete.setAthleteCode(generateAthleteCode());
        
        updateAthleteFields(athlete, dto);
        
        athlete.setCreatedBy(creatorId);
        athlete.setUpdatedBy(creatorId);

        return athleteRepository.save(athlete);
    }

    @Transactional
    public Athlete updateAthlete(Athlete athlete, AthleteRequestDTO dto, Integer updaterId) {
        updateAthleteFields(athlete, dto);
        athlete.setUpdatedBy(updaterId);
        return athleteRepository.save(athlete);
    }

    private void updateAthleteFields(Athlete athlete, AthleteRequestDTO dto) {
        if (isTruthy(dto.getFirstName())) athlete.setFirstName(dto.getFirstName());
        if (isTruthy(dto.getLastName())) athlete.setLastName(dto.getLastName());
        if (dto.getDateOfBirth() != null) athlete.setDateOfBirth(dto.getDateOfBirth());
        if (isTruthy(dto.getGender())) athlete.setGender(dto.getGender());
        if (isTruthy(dto.getBloodGroup())) athlete.setBloodGroup(dto.getBloodGroup());
        if (dto.getPhone() != null) athlete.setPhone(dto.getPhone());
        if (dto.getAddress() != null) athlete.setAddress(dto.getAddress());
        if (dto.getCity() != null) athlete.setCity(dto.getCity());
        if (dto.getState() != null) athlete.setState(dto.getState());
        if (dto.getCountry() != null) athlete.setCountry(dto.getCountry());
        if (dto.getEmergencyContactName() != null) athlete.setEmergencyContactName(dto.getEmergencyContactName());
        if (dto.getEmergencyContactNumber() != null) athlete.setEmergencyContactNumber(dto.getEmergencyContactNumber());
        if (dto.getHeight() != null) athlete.setHeight(dto.getHeight());
        if (dto.getWeight() != null) athlete.setWeight(dto.getWeight());
        if (dto.getOrganizationId() != null) athlete.setOrganizationId(dto.getOrganizationId());
        
        if (dto.getSportId() != null) {
            athlete.setSport(sportRepository.findById(dto.getSportId()).orElse(null));
        }

        if (isTruthy(dto.getStatus())) athlete.setStatus(dto.getStatus());
        if (isTruthy(dto.getMedicalStatus())) athlete.setMedicalStatus(dto.getMedicalStatus());
        if (dto.getPerformanceRating() != null) athlete.setPerformanceRating(dto.getPerformanceRating());
        if (dto.getNotes() != null) athlete.setNotes(dto.getNotes());
        
        if (dto.getInjuries() != null) {
            if (athlete.getInjuries() == null) {
                athlete.setInjuries(new ArrayList<>(dto.getInjuries()));
            } else {
                athlete.getInjuries().clear();
                athlete.getInjuries().addAll(dto.getInjuries());
            }
        }
        
        if (dto.getAchievements() != null) {
            if (athlete.getAchievements() == null) {
                athlete.setAchievements(new ArrayList<>(dto.getAchievements()));
            } else {
                athlete.getAchievements().clear();
                athlete.getAchievements().addAll(dto.getAchievements());
            }
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> listAthletes(String search, Integer sportId, String status, 
                                            String gender, Integer minAge, Integer maxAge, 
                                            Double minHeight, Double maxHeight, 
                                            Double minWeight, Double maxWeight, 
                                            String medicalStatus, Integer organizationId,
                                            int page, int pageSize, String sortBy, String sortDir) {
        return listAthletes(search, sportId, status, gender, minAge, maxAge, minHeight, maxHeight, minWeight, maxWeight, medicalStatus, organizationId, null, page, pageSize, sortBy, sortDir);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> listAthletes(String search, Integer sportId, String status, 
                                            String gender, Integer minAge, Integer maxAge, 
                                            Double minHeight, Double maxHeight, 
                                            Double minWeight, Double maxWeight, 
                                            String medicalStatus, Integer organizationId,
                                            List<Integer> allowedAthleteIds,
                                            int page, int pageSize, String sortBy, String sortDir) {
        Specification<Athlete> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(cb.notEqual(root.get("status"), "Deleted"));

            if (allowedAthleteIds != null) {
                if (allowedAthleteIds.isEmpty()) {
                    predicates.add(cb.disjunction());
                } else {
                    predicates.add(root.get("id").in(allowedAthleteIds));
                }
            }

            if (organizationId != null) {
                predicates.add(cb.equal(root.get("organizationId"), organizationId));
            }

            if (status != null && !status.isEmpty()) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (medicalStatus != null && !medicalStatus.isEmpty()) {
                predicates.add(cb.equal(root.get("medicalStatus"), medicalStatus));
            }
            if (gender != null && !gender.isEmpty()) {
                predicates.add(cb.equal(root.get("gender"), gender));
            }
            if (sportId != null) {
                predicates.add(cb.equal(root.get("sport").get("id"), sportId));
            }

            // Age filtering (convert to date of birth bounds)
            if (minAge != null) {
                LocalDate maxDob = LocalDate.now().minusYears(minAge);
                predicates.add(cb.lessThanOrEqualTo(root.get("dateOfBirth"), maxDob));
            }
            if (maxAge != null) {
                LocalDate minDob = LocalDate.now().minusYears(maxAge + 1).plusDays(1);
                predicates.add(cb.greaterThanOrEqualTo(root.get("dateOfBirth"), minDob));
            }

            // Height filtering
            if (minHeight != null) predicates.add(cb.greaterThanOrEqualTo(root.get("height"), minHeight));
            if (maxHeight != null) predicates.add(cb.lessThanOrEqualTo(root.get("height"), maxHeight));

            // Weight filtering
            if (minWeight != null) predicates.add(cb.greaterThanOrEqualTo(root.get("weight"), minWeight));
            if (maxWeight != null) predicates.add(cb.lessThanOrEqualTo(root.get("weight"), maxWeight));

            if (search != null && !search.isEmpty()) {
                String likeSearch = "%" + search + "%";
                Join<Object, Object> userJoin = root.join("user", JoinType.LEFT);
                predicates.add(cb.or(
                    cb.like(root.get("firstName"), likeSearch),
                    cb.like(root.get("lastName"), likeSearch),
                    cb.like(root.get("athleteCode"), likeSearch),
                    cb.like(root.get("phone"), likeSearch),
                    cb.equal(userJoin.get("email"), search)
                ));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);

        Page<Athlete> paginated = athleteRepository.findAll(spec, pageable);

        Map<String, Object> result = new HashMap<>();
        result.put("items", paginated.getContent().stream().map(this::getAthleteDetails).collect(Collectors.toList()));
        result.put("total_records", paginated.getTotalElements());
        result.put("total_pages", paginated.getTotalPages());
        result.put("page", page);
        result.put("page_size", pageSize);

        return result;
    }
}
