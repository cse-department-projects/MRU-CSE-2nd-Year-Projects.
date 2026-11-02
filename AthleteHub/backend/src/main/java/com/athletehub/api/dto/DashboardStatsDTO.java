package com.athletehub.api.dto;

import java.util.List;
import java.util.Map;

public class DashboardStatsDTO {
    private String welcome;
    private String role;
    private Integer profile_completion;
    private Integer athlete_id;
    private List<Map<String, Object>> notifications;
    private List<Map<String, Object>> quick_actions;
    private StatsDTO stats;

    public static class StatsDTO {
        private long total_organizations;
        private long active_organizations;
        private long orgs_this_month;
        private long total_athletes;
        private long athletes_without_organization;

        // Phase 7 Event Stats
        private long total_events;
        private long upcoming_events;
        private long active_events;
        private long completed_events;
        private long cancelled_events;
        
        private long active_tournaments;
        private long completed_tournaments;
        private long total_participants; // count of AthleteRegistration where status=PARTICIPATED
        
        private long pending_registrations;
        private long approved_registrations;
        private long rejected_registrations;
        private long withdrawn_registrations;
        
        private long todays_matches;
        private long scheduled_matches;
        private long live_matches;
        private long completed_matches;
        
        private long gold_medals;
        private long silver_medals;
        private long bronze_medals;
        private long total_medals;

        // Getters and Setters
        public long getTotal_organizations() { return total_organizations; }
        public void setTotal_organizations(long total_organizations) { this.total_organizations = total_organizations; }
        public long getActive_organizations() { return active_organizations; }
        public void setActive_organizations(long active_organizations) { this.active_organizations = active_organizations; }
        public long getOrgs_this_month() { return orgs_this_month; }
        public void setOrgs_this_month(long orgs_this_month) { this.orgs_this_month = orgs_this_month; }
        public long getTotal_athletes() { return total_athletes; }
        public void setTotal_athletes(long total_athletes) { this.total_athletes = total_athletes; }
        public long getAthletes_without_organization() { return athletes_without_organization; }
        public void setAthletes_without_organization(long athletes_without_organization) { this.athletes_without_organization = athletes_without_organization; }

        public long getTotal_events() { return total_events; }
        public void setTotal_events(long total_events) { this.total_events = total_events; }
        public long getUpcoming_events() { return upcoming_events; }
        public void setUpcoming_events(long upcoming_events) { this.upcoming_events = upcoming_events; }
        public long getActive_events() { return active_events; }
        public void setActive_events(long active_events) { this.active_events = active_events; }
        public long getCompleted_events() { return completed_events; }
        public void setCompleted_events(long completed_events) { this.completed_events = completed_events; }
        public long getCancelled_events() { return cancelled_events; }
        public void setCancelled_events(long cancelled_events) { this.cancelled_events = cancelled_events; }

        public long getActive_tournaments() { return active_tournaments; }
        public void setActive_tournaments(long active_tournaments) { this.active_tournaments = active_tournaments; }
        public long getCompleted_tournaments() { return completed_tournaments; }
        public void setCompleted_tournaments(long completed_tournaments) { this.completed_tournaments = completed_tournaments; }
        public long getTotal_participants() { return total_participants; }
        public void setTotal_participants(long total_participants) { this.total_participants = total_participants; }

        public long getPending_registrations() { return pending_registrations; }
        public void setPending_registrations(long pending_registrations) { this.pending_registrations = pending_registrations; }
        public long getApproved_registrations() { return approved_registrations; }
        public void setApproved_registrations(long approved_registrations) { this.approved_registrations = approved_registrations; }
        public long getRejected_registrations() { return rejected_registrations; }
        public void setRejected_registrations(long rejected_registrations) { this.rejected_registrations = rejected_registrations; }
        public long getWithdrawn_registrations() { return withdrawn_registrations; }
        public void setWithdrawn_registrations(long withdrawn_registrations) { this.withdrawn_registrations = withdrawn_registrations; }

        public long getTodays_matches() { return todays_matches; }
        public void setTodays_matches(long todays_matches) { this.todays_matches = todays_matches; }
        public long getScheduled_matches() { return scheduled_matches; }
        public void setScheduled_matches(long scheduled_matches) { this.scheduled_matches = scheduled_matches; }
        public long getLive_matches() { return live_matches; }
        public void setLive_matches(long live_matches) { this.live_matches = live_matches; }
        public long getCompleted_matches() { return completed_matches; }
        public void setCompleted_matches(long completed_matches) { this.completed_matches = completed_matches; }

        public long getGold_medals() { return gold_medals; }
        public void setGold_medals(long gold_medals) { this.gold_medals = gold_medals; }
        public long getSilver_medals() { return silver_medals; }
        public void setSilver_medals(long silver_medals) { this.silver_medals = silver_medals; }
        public long getBronze_medals() { return bronze_medals; }
        public void setBronze_medals(long bronze_medals) { this.bronze_medals = bronze_medals; }
        public long getTotal_medals() { return total_medals; }
        public void setTotal_medals(long total_medals) { this.total_medals = total_medals; }
    }

    // Getters and Setters
    public String getWelcome() { return welcome; }
    public void setWelcome(String welcome) { this.welcome = welcome; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Integer getProfile_completion() { return profile_completion; }
    public void setProfile_completion(Integer profile_completion) { this.profile_completion = profile_completion; }
    public Integer getAthlete_id() { return athlete_id; }
    public void setAthlete_id(Integer athlete_id) { this.athlete_id = athlete_id; }
    public List<Map<String, Object>> getNotifications() { return notifications; }
    public void setNotifications(List<Map<String, Object>> notifications) { this.notifications = notifications; }
    public List<Map<String, Object>> getQuick_actions() { return quick_actions; }
    public void setQuick_actions(List<Map<String, Object>> quick_actions) { this.quick_actions = quick_actions; }
    public StatsDTO getStats() { return stats; }
    public void setStats(StatsDTO stats) { this.stats = stats; }
}
