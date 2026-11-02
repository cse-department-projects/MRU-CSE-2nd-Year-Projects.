package com.athletehub.api.dto;

import com.athletehub.api.entity.TrainingPlan;
import org.springframework.stereotype.Component;

@Component
public class TrainingPlanMapper {

    public TrainingPlanDTO toDTO(TrainingPlan entity) {
        if (entity == null) {
            return null;
        }

        TrainingPlanDTO dto = new TrainingPlanDTO();
        dto.setId(entity.getId());
        dto.setPlanCode(entity.getPlanCode());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());

        if (entity.getSport() != null) {
            dto.setSportId(entity.getSport().getId());
            dto.setSportName(entity.getSport().getName());
        }

        if (entity.getOrganization() != null) {
            dto.setOrganizationId(entity.getOrganization().getId());
            dto.setOrganizationName(entity.getOrganization().getName());
        }

        if (entity.getCreatedBy() != null) {
            dto.setCreatedBy(entity.getCreatedBy().getId());
            dto.setCreatorName(entity.getCreatedBy().getFirstName() + " " + entity.getCreatedBy().getLastName());
        }

        if (entity.getDifficultyLevel() != null) {
            dto.setDifficultyLevel(entity.getDifficultyLevel().name());
        }
        
        dto.setDurationWeeks(entity.getDurationWeeks());

        if (entity.getStatus() != null) {
            dto.setStatus(entity.getStatus().name());
        }

        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        return dto;
    }
}
