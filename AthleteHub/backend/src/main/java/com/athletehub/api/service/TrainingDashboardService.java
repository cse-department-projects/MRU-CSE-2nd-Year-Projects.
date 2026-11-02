package com.athletehub.api.service;

import com.athletehub.api.dto.TrainingDashboardStatsDTO;

public interface TrainingDashboardService {
    TrainingDashboardStatsDTO getDashboardStats(Integer organizationId, Integer coachId, Integer athleteId);
}
