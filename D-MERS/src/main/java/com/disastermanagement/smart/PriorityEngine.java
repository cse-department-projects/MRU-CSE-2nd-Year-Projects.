package com.disastermanagement.smart;

import com.disastermanagement.model.DisasterReport;
import com.disastermanagement.model.RescueRequest;

import java.time.Duration;
import java.time.LocalDateTime;

/**
 * Smart Rescue Priority Engine
 * Calculates a project-level emergency decision-support priority score (0-100)
 * and priority classification (LOW, MEDIUM, HIGH, CRITICAL).
 */
public class PriorityEngine {

    public static class PriorityResult {
        private final int score;
        private final String level; // LOW, MEDIUM, HIGH, CRITICAL
        private final String breakdown;

        public PriorityResult(int score, String level, String breakdown) {
            this.score = Math.min(100, Math.max(0, score));
            this.level = level;
            this.breakdown = breakdown;
        }

        public int getScore() {
            return score;
        }

        public String getLevel() {
            return level;
        }

        public String getBreakdown() {
            return breakdown;
        }
    }

    /**
     * Calculate Priority Score for a Rescue Request based on multiple weighted factors.
     */
    public static PriorityResult calculatePriority(
            String severityStr,
            int affectedPeople,
            int peopleNeedingHelp,
            String emergencyType,
            boolean medicalRequired,
            LocalDateTime createdAt
    ) {
        int score = 0;
        StringBuilder breakdown = new StringBuilder();

        // 1. Severity Factor (Base weight up to 40 pts)
        int severityPoints = 0;
        String sev = (severityStr != null) ? severityStr.toUpperCase() : "MEDIUM";
        switch (sev) {
            case "CRITICAL":
                severityPoints = 40;
                break;
            case "HIGH":
                severityPoints = 30;
                break;
            case "MEDIUM":
                severityPoints = 20;
                break;
            case "LOW":
            default:
                severityPoints = 10;
                break;
        }
        score += severityPoints;
        breakdown.append("Severity (").append(sev).append("): +").append(severityPoints).append(" pts\n");

        // 2. Affected People Scale (Weight up to 20 pts)
        int affectedPoints = 0;
        if (affectedPeople >= 50) affectedPoints = 20;
        else if (affectedPeople >= 20) affectedPoints = 15;
        else if (affectedPeople >= 5) affectedPoints = 10;
        else if (affectedPeople >= 1) affectedPoints = 5;

        score += affectedPoints;
        breakdown.append("People Affected (").append(affectedPeople).append("): +").append(affectedPoints).append(" pts\n");

        // 3. Immediate Help Requirement (Weight up to 15 pts)
        int immediatePoints = 0;
        if (peopleNeedingHelp >= 10) immediatePoints = 15;
        else if (peopleNeedingHelp >= 3) immediatePoints = 10;
        else if (peopleNeedingHelp >= 1) immediatePoints = 5;

        score += immediatePoints;
        breakdown.append("Immediate Help Required (").append(peopleNeedingHelp).append("): +").append(immediatePoints).append(" pts\n");

        // 4. Medical Assistance Requirement (Weight 15 pts)
        int medicalPoints = medicalRequired ? 15 : 0;
        score += medicalPoints;
        if (medicalRequired) {
            breakdown.append("Medical Assistance Required: +15 pts\n");
        }

        // 5. Emergency Type Vulnerability Risk (Weight up to 10 pts)
        int typePoints = 5;
        String type = (emergencyType != null) ? emergencyType.toUpperCase() : "";
        if (type.contains("FIRE") || type.contains("COLLAPSE") || type.contains("EARTHQUAKE")) {
            typePoints = 10;
        } else if (type.contains("FLOOD") || type.contains("CYCLONE") || type.contains("LANDSLIDE")) {
            typePoints = 8;
        }
        score += typePoints;
        breakdown.append("Hazard Type Risk (").append(type).append("): +").append(typePoints).append(" pts\n");

        // 6. Waiting Time Bonus (up to 10 pts)
        if (createdAt != null) {
            long minutesWaiting = Duration.between(createdAt, LocalDateTime.now()).toMinutes();
            int timeBonus = (int) Math.min(10, minutesWaiting / 15); // +1 pt per 15 mins waiting
            if (timeBonus > 0) {
                score += timeBonus;
                breakdown.append("Elapsed Waiting Time (").append(minutesWaiting).append("m): +").append(timeBonus).append(" pts\n");
            }
        }

        int finalScore = Math.min(100, Math.max(0, score));

        // Determine Priority Level Classification
        String level;
        if (finalScore >= 80) {
            level = "CRITICAL";
        } else if (finalScore >= 60) {
            level = "HIGH";
        } else if (finalScore >= 40) {
            level = "MEDIUM";
        } else {
            level = "LOW";
        }

        breakdown.append("----------------------------\n");
        breakdown.append("TOTAL SMART PRIORITY SCORE: ").append(finalScore).append("/100 (").append(level).append(")");

        return new PriorityResult(finalScore, level, breakdown.toString());
    }

    /**
     * Helper for Disaster Report calculation
     */
    public static PriorityResult calculateReportPriority(DisasterReport report) {
        if (report == null) return new PriorityResult(30, "LOW", "Default calculation");
        return calculatePriority(
                report.getSeverity(),
                report.getAffectedPeople(),
                report.getPeopleNeedingHelp(),
                report.getDisasterType(),
                report.getSeverity() != null && report.getSeverity().equalsIgnoreCase("CRITICAL"),
                report.getCreatedAt()
        );
    }
}
