package com.athletehub.api.service;

import com.athletehub.api.dto.TrainingPlanDTO;
import com.athletehub.api.dto.TrainingPlanRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TrainingPlanService {
    TrainingPlanDTO createTrainingPlan(TrainingPlanRequest request);
    TrainingPlanDTO updateTrainingPlan(Integer id, TrainingPlanRequest request);
    TrainingPlanDTO getTrainingPlanById(Integer id);
    void deleteTrainingPlan(Integer id);
    Page<TrainingPlanDTO> searchTrainingPlans(String search, Integer organizationId, Integer coachId, Integer sportId, String status, String difficultyLevel, Pageable pageable);
}
