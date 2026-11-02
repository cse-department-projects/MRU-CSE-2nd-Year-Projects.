package com.athletehub.api.dto;

import com.athletehub.api.entity.TrainingSession;
import org.springframework.stereotype.Component;

@Component
public class TrainingSessionMapper {

    public TrainingSessionDTO toDTO(TrainingSession entity) {
        if (entity == null) {
            return null;
        }

        TrainingSessionDTO dto = new TrainingSessionDTO();
        dto.setId(entity.getId());
        dto.setSessionCode(entity.getSessionCode());

        if (entity.getTrainingPlan() != null) {
            dto.setTrainingPlanId(entity.getTrainingPlan().getId());
            dto.setTrainingPlanTitle(entity.getTrainingPlan().getTitle());
        }

        if (entity.getTeam() != null) {
            dto.setTeamId(entity.getTeam().getId());
            dto.setTeamName(entity.getTeam().getName());
            if (entity.getTeam().getCoach() != null && dto.getCoachId() == null) {
                dto.setCoachId(entity.getTeam().getCoach().getId());
                dto.setCoachName(entity.getTeam().getCoach().getFirstName() + " " + entity.getTeam().getCoach().getLastName());
            }
        }

        if (entity.getCoachAssignment() != null) {
            dto.setCoachAssignmentId(entity.getCoachAssignment().getId());
            if (entity.getCoachAssignment().getCoach() != null) {
                dto.setCoachId(entity.getCoachAssignment().getCoach().getId());
                dto.setCoachName(entity.getCoachAssignment().getCoach().getFirstName() + " " + entity.getCoachAssignment().getCoach().getLastName());
            }
            if (entity.getCoachAssignment().getAthlete() != null) {
                dto.setAthleteId(entity.getCoachAssignment().getAthlete().getId());
                dto.setAthleteName(entity.getCoachAssignment().getAthlete().getFirstName() + " " + entity.getCoachAssignment().getAthlete().getLastName());
            }
        }

        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setSessionDate(entity.getSessionDate());
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        dto.setVenue(entity.getVenue());
        dto.setSessionType(entity.getSessionType());

        if (entity.getIntensity() != null) {
            dto.setIntensity(entity.getIntensity().name());
        }

        if (entity.getStatus() != null) {
            dto.setStatus(entity.getStatus().name());
        }

        dto.setRemarks(entity.getRemarks());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        return dto;
    }
}
