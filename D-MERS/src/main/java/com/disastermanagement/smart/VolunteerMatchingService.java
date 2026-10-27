package com.disastermanagement.smart;

import com.disastermanagement.model.Volunteer;
import com.disastermanagement.model.VolunteerTask;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Smart Volunteer Matching Engine
 * Ranks available volunteers for an emergency task based on:
 * 1. Skill compatibility (50%)
 * 2. Availability status (30%)
 * 3. Location proximity match (20%)
 */
public class VolunteerMatchingService {

    public static class VolunteerMatch {
        private final Volunteer volunteer;
        private final int matchScore; // 0 to 100%
        private final String matchReason;

        public VolunteerMatch(Volunteer volunteer, int matchScore, String matchReason) {
            this.volunteer = volunteer;
            this.matchScore = Math.min(100, Math.max(0, matchScore));
            this.matchReason = matchReason;
        }

        public Volunteer getVolunteer() {
            return volunteer;
        }

        public int getMatchScore() {
            return matchScore;
        }

        public String getMatchReason() {
            return matchReason;
        }
    }

    /**
     * Finds and ranks top volunteer matches for a specific task.
     */
    public static List<VolunteerMatch> matchVolunteers(VolunteerTask task, List<Volunteer> allVolunteers) {
        List<VolunteerMatch> matches = new ArrayList<>();
        if (task == null || allVolunteers == null) return matches;

        String requiredSkill = (task.getRequiredSkill() != null) ? task.getRequiredSkill().name() : "";
        String taskLocation = task.getLocation() != null ? task.getLocation().toLowerCase() : "";

        for (Volunteer v : allVolunteers) {
            int score = 0;
            StringBuilder reason = new StringBuilder();

            // 1. Skill Compatibility Match (Up to 50 pts)
            String volSkill = (v.getSkill() != null) ? v.getSkill().name() : "";
            if (volSkill.equalsIgnoreCase(requiredSkill)) {
                score += 50;
                reason.append("Direct Skill Match (").append(volSkill).append("): +50%\n");
            } else if (volSkill.contains("FIRST_AID") || volSkill.contains("RESCUE") || requiredSkill.isEmpty()) {
                score += 30;
                reason.append("Related Skill Match: +30%\n");
            } else {
                score += 15;
                reason.append("General Volunteer Support: +15%\n");
            }

            // 2. Availability Status (Up to 30 pts)
            String avail = (v.getAvailability() != null) ? v.getAvailability().name() : "AVAILABLE";
            if ("AVAILABLE".equalsIgnoreCase(avail)) {
                score += 30;
                reason.append("Status Available: +30%\n");
            } else if ("BUSY".equalsIgnoreCase(avail)) {
                score += 10;
                reason.append("Currently Busy (+10%)\n");
            } else {
                reason.append("Unavailable (0%)\n");
            }

            // 3. Location Proximity (Up to 20 pts)
            String volLoc = v.getLocation() != null ? v.getLocation().toLowerCase() : "";
            if (!volLoc.isEmpty() && !taskLocation.isEmpty() && (volLoc.contains(taskLocation) || taskLocation.contains(volLoc))) {
                score += 20;
                reason.append("Nearby Location Match: +20%\n");
            } else if (!volLoc.isEmpty()) {
                score += 10;
                reason.append("Same Region Match: +10%\n");
            }

            matches.add(new VolunteerMatch(v, score, reason.toString().trim()));
        }

        // Sort descending by matchScore
        matches.sort(Comparator.comparingInt(VolunteerMatch::getMatchScore).reversed());
        return matches;
    }
}
