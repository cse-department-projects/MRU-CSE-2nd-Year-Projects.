package com.athletehub.api.dto;

public class TrainingPlanResponse {
    private TrainingPlanDTO plan;

    public TrainingPlanResponse() {}

    public TrainingPlanResponse(TrainingPlanDTO plan) {
        this.plan = plan;
    }

    public TrainingPlanDTO getPlan() { return plan; }
    public void setPlan(TrainingPlanDTO plan) { this.plan = plan; }
}
