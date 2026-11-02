package com.athletehub.api.dto;

import com.athletehub.api.entity.CoachAssignment;
import com.athletehub.api.entity.enums.AssignmentStatus;
import org.springframework.stereotype.Component;

@Component
public class CoachAssignmentMapper {

    public CoachAssignmentDTO toDto(CoachAssignment entity) {
        if (entity == null) return null;
        
        CoachAssignmentDTO dto = new CoachAssignmentDTO();
        dto.setId(entity.getId());
        dto.setAssignmentCode(entity.getAssignmentCode());
        
        if (entity.getCoach() != null) {
            dto.setCoachId(entity.getCoach().getId());
            dto.setCoachCode(entity.getCoach().getCoachCode());
            dto.setCoachName(entity.getCoach().getFirstName() + " " + entity.getCoach().getLastName());
            dto.setCoachSpecialization(entity.getCoach().getSpecialization());
        }
        
        if (entity.getAthlete() != null) {
            dto.setAthleteId(entity.getAthlete().getId());
            dto.setAthleteCode(entity.getAthlete().getAthleteCode());
            dto.setAthleteName(entity.getAthlete().getFirstName() + " " + entity.getAthlete().getLastName());
            if (entity.getAthlete().getSport() != null) {
                dto.setSportName(entity.getAthlete().getSport().getName());
                dto.setSportCategory(entity.getAthlete().getSport().getCategory());
            }
        }
        
        if (entity.getOrganization() != null) {
            dto.setOrganizationId(entity.getOrganization().getId());
            dto.setOrganizationName(entity.getOrganization().getName());
        }
        
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        dto.setRemarks(entity.getRemarks());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        return dto;
    }
}
