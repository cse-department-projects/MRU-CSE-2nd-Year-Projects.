package com.athletehub.api.dto;

import com.athletehub.api.entity.Coach;
import com.athletehub.api.entity.enums.Gender;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class CoachMapper {

    private static final Map<String, Integer> PROFILE_WEIGHTS = Map.ofEntries(
        Map.entry("firstName", 10),
        Map.entry("lastName", 10),
        Map.entry("gender", 5),
        Map.entry("dateOfBirth", 5),
        Map.entry("phone", 10),
        Map.entry("email", 10),
        Map.entry("qualification", 10),
        Map.entry("experienceYears", 10),
        Map.entry("certifications", 10),
        Map.entry("organization", 10),
        Map.entry("profilePhoto", 5),
        Map.entry("specialization", 5)
    );

    public int calculateProfileCompletion(Coach coach) {
        if (coach == null) return 0;
        int score = 0;
        int totalWeight = PROFILE_WEIGHTS.values().stream().mapToInt(Integer::intValue).sum();

        if (isTruthy(coach.getFirstName())) score += PROFILE_WEIGHTS.get("firstName");
        if (isTruthy(coach.getLastName())) score += PROFILE_WEIGHTS.get("lastName");
        if (coach.getGender() != null) score += PROFILE_WEIGHTS.get("gender");
        if (coach.getDateOfBirth() != null) score += PROFILE_WEIGHTS.get("dateOfBirth");
        if (isTruthy(coach.getPhone())) score += PROFILE_WEIGHTS.get("phone");
        if (isTruthy(coach.getEmail())) score += PROFILE_WEIGHTS.get("email");
        if (isTruthy(coach.getQualification())) score += PROFILE_WEIGHTS.get("qualification");
        if (coach.getExperienceYears() != null) score += PROFILE_WEIGHTS.get("experienceYears");
        if (isTruthy(coach.getCertifications())) score += PROFILE_WEIGHTS.get("certifications");
        if (coach.getOrganizationId() != null) score += PROFILE_WEIGHTS.get("organization");
        if (isTruthy(coach.getProfilePhoto())) score += PROFILE_WEIGHTS.get("profilePhoto");
        if (isTruthy(coach.getSpecialization())) score += PROFILE_WEIGHTS.get("specialization");

        return (int) (((double) score / totalWeight) * 100);
    }

    private boolean isTruthy(String val) {
        return val != null && !val.trim().isEmpty();
    }

    public CoachDTO toDto(Coach coach) {
        if (coach == null) return null;

        CoachDTO dto = new CoachDTO();
        dto.setId(coach.getId());
        dto.setCoachCode(coach.getCoachCode());
        dto.setUserId(coach.getUserId());
        dto.setFirstName(coach.getFirstName());
        dto.setLastName(coach.getLastName());
        dto.setGender(coach.getGender() != null ? coach.getGender().name() : null);
        dto.setDateOfBirth(coach.getDateOfBirth());
        dto.setPhone(coach.getPhone());
        dto.setEmail(coach.getEmail());
        dto.setSpecialization(coach.getSpecialization());
        dto.setQualification(coach.getQualification());
        dto.setExperienceYears(coach.getExperienceYears());
        dto.setCertifications(coach.getCertifications());
        dto.setOrganizationId(coach.getOrganizationId());
        
        if (coach.getOrganization() != null) {
            dto.setOrganizationName(coach.getOrganization().getName());
        }

        dto.setStatus(coach.getStatus() != null ? coach.getStatus().name() : null);
        dto.setProfilePhoto(coach.getProfilePhoto());
        dto.setProfileCompletion(calculateProfileCompletion(coach));
        dto.setCreatedAt(coach.getCreatedAt());
        dto.setUpdatedAt(coach.getUpdatedAt());

        return dto;
    }

    public void updateEntityFromRequest(CoachRequest request, Coach coach) {
        if (request.getFirstName() != null) coach.setFirstName(request.getFirstName());
        if (request.getLastName() != null) coach.setLastName(request.getLastName());
        if (request.getGender() != null) {
            try {
                coach.setGender(Gender.valueOf(request.getGender().toUpperCase()));
            } catch (IllegalArgumentException ignored) {}
        }
        if (request.getDateOfBirth() != null) coach.setDateOfBirth(request.getDateOfBirth());
        if (request.getPhone() != null) coach.setPhone(request.getPhone());
        if (request.getEmail() != null) coach.setEmail(request.getEmail());
        if (request.getSpecialization() != null) coach.setSpecialization(request.getSpecialization());
        if (request.getQualification() != null) coach.setQualification(request.getQualification());
        if (request.getExperienceYears() != null) coach.setExperienceYears(request.getExperienceYears());
        if (request.getCertifications() != null) coach.setCertifications(request.getCertifications());
        if (request.getOrganizationId() != null) coach.setOrganizationId(request.getOrganizationId());
        if (request.getProfilePhoto() != null) coach.setProfilePhoto(request.getProfilePhoto());
    }
}
