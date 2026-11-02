package com.athletehub.api.dto;

import java.util.Map;

public class TrainingDashboardStatsDTO {
    
    private Map<String, Object> trainingPlans;
    private Map<String, Object> trainingSessions;
    private Map<String, Object> attendance;
    private Map<String, Object> coachStatistics;
    private Map<String, Object> athleteStatistics;

    public Map<String, Object> getTrainingPlans() { return trainingPlans; }
    public void setTrainingPlans(Map<String, Object> trainingPlans) { this.trainingPlans = trainingPlans; }

    public Map<String, Object> getTrainingSessions() { return trainingSessions; }
    public void setTrainingSessions(Map<String, Object> trainingSessions) { this.trainingSessions = trainingSessions; }

    public Map<String, Object> getAttendance() { return attendance; }
    public void setAttendance(Map<String, Object> attendance) { this.attendance = attendance; }

    public Map<String, Object> getCoachStatistics() { return coachStatistics; }
    public void setCoachStatistics(Map<String, Object> coachStatistics) { this.coachStatistics = coachStatistics; }

    public Map<String, Object> getAthleteStatistics() { return athleteStatistics; }
    public void setAthleteStatistics(Map<String, Object> athleteStatistics) { this.athleteStatistics = athleteStatistics; }
}
