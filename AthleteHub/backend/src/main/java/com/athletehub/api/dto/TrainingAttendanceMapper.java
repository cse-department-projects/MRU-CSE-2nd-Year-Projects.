package com.athletehub.api.dto;

import com.athletehub.api.entity.TrainingAttendance;
import org.springframework.stereotype.Component;

@Component
public class TrainingAttendanceMapper {

    public TrainingAttendanceDTO toDTO(TrainingAttendance entity) {
        if (entity == null) {
            return null;
        }

        TrainingAttendanceDTO dto = new TrainingAttendanceDTO();
        dto.setId(entity.getId());
        dto.setAttendanceCode(entity.getAttendanceCode());

        if (entity.getTrainingSession() != null) {
            dto.setTrainingSessionId(entity.getTrainingSession().getId());
            dto.setTrainingSessionTitle(entity.getTrainingSession().getTitle());
        }

        if (entity.getAthlete() != null) {
            dto.setAthleteId(entity.getAthlete().getId());
            dto.setAthleteName(entity.getAthlete().getFirstName() + " " + entity.getAthlete().getLastName());
        }

        if (entity.getAttendanceStatus() != null) {
            dto.setAttendanceStatus(entity.getAttendanceStatus().name());
        }

        dto.setCoachNotes(entity.getCoachNotes());
        dto.setAthleteFeedback(entity.getAthleteFeedback());
        dto.setInjuryReport(entity.getInjuryReport());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        return dto;
    }
}
