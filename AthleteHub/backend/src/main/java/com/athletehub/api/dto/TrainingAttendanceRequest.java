package com.athletehub.api.dto;

public class TrainingAttendanceRequest {
    private Integer trainingSessionId;
    private Integer athleteId;
    private String attendanceStatus;
    private String coachNotes;
    private String athleteFeedback;
    private String injuryReport;

    public Integer getTrainingSessionId() { return trainingSessionId; }
    public void setTrainingSessionId(Integer trainingSessionId) { this.trainingSessionId = trainingSessionId; }

    public Integer getAthleteId() { return athleteId; }
    public void setAthleteId(Integer athleteId) { this.athleteId = athleteId; }

    public String getAttendanceStatus() { return attendanceStatus; }
    public void setAttendanceStatus(String attendanceStatus) { this.attendanceStatus = attendanceStatus; }

    public String getCoachNotes() { return coachNotes; }
    public void setCoachNotes(String coachNotes) { this.coachNotes = coachNotes; }

    public String getAthleteFeedback() { return athleteFeedback; }
    public void setAthleteFeedback(String athleteFeedback) { this.athleteFeedback = athleteFeedback; }

    public String getInjuryReport() { return injuryReport; }
    public void setInjuryReport(String injuryReport) { this.injuryReport = injuryReport; }
}
