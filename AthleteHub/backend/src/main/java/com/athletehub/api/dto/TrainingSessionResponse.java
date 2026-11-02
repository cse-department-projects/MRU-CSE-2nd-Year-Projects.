package com.athletehub.api.dto;

public class TrainingSessionResponse {
    private TrainingSessionDTO session;

    public TrainingSessionResponse() {}

    public TrainingSessionResponse(TrainingSessionDTO session) {
        this.session = session;
    }

    public TrainingSessionDTO getSession() { return session; }
    public void setSession(TrainingSessionDTO session) { this.session = session; }
}
