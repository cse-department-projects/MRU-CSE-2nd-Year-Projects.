package com.athletehub.api.service;

import com.athletehub.api.dto.TrainingSessionDTO;
import com.athletehub.api.dto.TrainingSessionRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;

public interface TrainingSessionService {
    TrainingSessionDTO createTrainingSession(TrainingSessionRequest request);
    TrainingSessionDTO updateTrainingSession(Integer id, TrainingSessionRequest request);
    TrainingSessionDTO getTrainingSessionById(Integer id);
    void deleteTrainingSession(Integer id);
    Page<TrainingSessionDTO> searchTrainingSessions(String search, Integer organizationId, Integer coachId, Integer athleteId, Integer teamId, Integer trainingPlanId, LocalDate startDate, LocalDate endDate, String status, String intensity, Pageable pageable);
}
