package com.athletehub.api.dto;

public class TrainingAttendanceResponse {
    private TrainingAttendanceDTO attendance;

    public TrainingAttendanceResponse() {}

    public TrainingAttendanceResponse(TrainingAttendanceDTO attendance) {
        this.attendance = attendance;
    }

    public TrainingAttendanceDTO getAttendance() { return attendance; }
    public void setAttendance(TrainingAttendanceDTO attendance) { this.attendance = attendance; }
}
