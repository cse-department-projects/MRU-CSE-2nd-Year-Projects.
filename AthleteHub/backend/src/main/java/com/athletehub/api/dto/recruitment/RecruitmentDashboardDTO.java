package com.athletehub.api.dto.recruitment;

public class RecruitmentDashboardDTO {
    private long totalProspects;
    private long activePipeline;
    private long shortlistedAthletes;
    private long selectedAthletes;
    private long rejectedAthletes;
    private long upcomingTrials;
    private long overdueTasks;
    
    // Getters and Setters
    public long getTotalProspects() { return totalProspects; }
    public void setTotalProspects(long totalProspects) { this.totalProspects = totalProspects; }
    public long getActivePipeline() { return activePipeline; }
    public void setActivePipeline(long activePipeline) { this.activePipeline = activePipeline; }
    public long getShortlistedAthletes() { return shortlistedAthletes; }
    public void setShortlistedAthletes(long shortlistedAthletes) { this.shortlistedAthletes = shortlistedAthletes; }
    public long getSelectedAthletes() { return selectedAthletes; }
    public void setSelectedAthletes(long selectedAthletes) { this.selectedAthletes = selectedAthletes; }
    public long getRejectedAthletes() { return rejectedAthletes; }
    public void setRejectedAthletes(long rejectedAthletes) { this.rejectedAthletes = rejectedAthletes; }
    public long getUpcomingTrials() { return upcomingTrials; }
    public void setUpcomingTrials(long upcomingTrials) { this.upcomingTrials = upcomingTrials; }
    public long getOverdueTasks() { return overdueTasks; }
    public void setOverdueTasks(long overdueTasks) { this.overdueTasks = overdueTasks; }
}
