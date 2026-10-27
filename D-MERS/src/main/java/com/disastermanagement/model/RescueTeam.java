package com.disastermanagement.model;

public class RescueTeam {
    public enum TeamStatus {
        AVAILABLE, DEPLOYED, OFF_DUTY;
        public static TeamStatus fromString(String text) {
            if (text == null) return AVAILABLE;
            for (TeamStatus s : values()) {
                if (s.name().equalsIgnoreCase(text)) return s;
            }
            return AVAILABLE;
        }
    }

    private int teamId;
    private int userId;
    private String teamName;
    private String leaderName;
    private String contactNumber;
    private String specialization;
    private TeamStatus activeStatus;

    public RescueTeam() {}

    public RescueTeam(int teamId, int userId, String teamName, String leaderName, String contactNumber, String specialization, TeamStatus activeStatus) {
        this.teamId = teamId;
        this.userId = userId;
        this.teamName = teamName;
        this.leaderName = leaderName;
        this.contactNumber = contactNumber;
        this.specialization = specialization;
        this.activeStatus = activeStatus;
    }

    // Getters & Setters
    public int getTeamId() { return teamId; }
    public void setTeamId(int teamId) { this.teamId = teamId; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public String getLeaderName() { return leaderName; }
    public void setLeaderName(String leaderName) { this.leaderName = leaderName; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public TeamStatus getActiveStatus() { return activeStatus; }
    public void setActiveStatus(TeamStatus activeStatus) { this.activeStatus = activeStatus; }

    @Override
    public String toString() {
        return teamName + " (" + specialization + ")";
    }
}
