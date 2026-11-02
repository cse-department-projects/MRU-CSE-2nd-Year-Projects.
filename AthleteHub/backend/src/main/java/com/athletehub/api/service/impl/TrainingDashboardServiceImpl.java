package com.athletehub.api.service.impl;

import com.athletehub.api.dto.TrainingDashboardStatsDTO;
import com.athletehub.api.entity.enums.AttendanceStatus;
import com.athletehub.api.entity.enums.TrainingPlanStatus;
import com.athletehub.api.entity.enums.TrainingSessionStatus;
import com.athletehub.api.repository.TrainingAttendanceRepository;
import com.athletehub.api.repository.TrainingPlanRepository;
import com.athletehub.api.repository.TrainingSessionRepository;
import com.athletehub.api.service.TrainingDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TrainingDashboardServiceImpl implements TrainingDashboardService {

    @Autowired
    private TrainingPlanRepository trainingPlanRepository;

    @Autowired
    private TrainingSessionRepository trainingSessionRepository;

    @Autowired
    private TrainingAttendanceRepository trainingAttendanceRepository;

    @Autowired
    private com.athletehub.api.security.TenantSecurityService tenantSecurityService;

    @Override
    @Transactional(readOnly = true)
    public TrainingDashboardStatsDTO getDashboardStats(Integer organizationId, Integer coachId, Integer athleteId) {
        TrainingDashboardStatsDTO stats = new TrainingDashboardStatsDTO();
        
        final Integer effOrgId;
        final Integer effCoachId;
        final Integer effAthleteId;

        if (tenantSecurityService.isSuperAdmin()) {
            effOrgId = organizationId;
            effCoachId = coachId;
            effAthleteId = athleteId;
        } else if (tenantSecurityService.isOrgAdmin()) {
            effOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            effCoachId = coachId;
            effAthleteId = athleteId;
        } else if (tenantSecurityService.isCoach()) {
            effOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            com.athletehub.api.entity.Coach coach = tenantSecurityService.getCurrentCoach();
            effCoachId = coach != null ? coach.getId() : -1;
            effAthleteId = athleteId;
        } else if (tenantSecurityService.isAthlete()) {
            effOrgId = tenantSecurityService.getCurrentUserOrganizationId();
            effCoachId = coachId;
            com.athletehub.api.entity.Athlete athlete = tenantSecurityService.getCurrentAthlete();
            effAthleteId = athlete != null ? athlete.getId() : -1;
        } else {
            effOrgId = -1;
            effCoachId = -1;
            effAthleteId = -1;
        }

        // Training Plans Stats
        Map<String, Object> plans = new HashMap<>();
        List<com.athletehub.api.entity.TrainingPlan> allPlans = trainingPlanRepository.findAll().stream()
                .filter(p -> effOrgId == null || (p.getOrganization() != null && effOrgId.equals(p.getOrganization().getId())))
                .filter(p -> effCoachId == null || (p.getCreatedBy() != null && effCoachId.equals(p.getCreatedBy().getId())))
                .collect(Collectors.toList());

        long totalPlans = allPlans.size();
        long activePlans = allPlans.stream().filter(p -> p.getStatus() != null && p.getStatus() == TrainingPlanStatus.ACTIVE).count();
        long completedPlans = allPlans.stream().filter(p -> p.getStatus() != null && p.getStatus() == TrainingPlanStatus.COMPLETED).count();
        long archivedPlans = allPlans.stream().filter(p -> p.getStatus() != null && p.getStatus() == TrainingPlanStatus.ARCHIVED).count();
        plans.put("total", totalPlans);
        plans.put("active", activePlans);
        plans.put("completed", completedPlans);
        plans.put("archived", archivedPlans);
        stats.setTrainingPlans(plans);

        // Training Sessions Stats
        Map<String, Object> sessions = new HashMap<>();
        LocalDate today = LocalDate.now();
        List<com.athletehub.api.entity.TrainingSession> allSessions = trainingSessionRepository.findAll().stream()
                .filter(s -> effOrgId == null || (s.getCoachAssignment() != null && s.getCoachAssignment().getOrganization() != null && effOrgId.equals(s.getCoachAssignment().getOrganization().getId())))
                .filter(s -> effCoachId == null || (s.getCoachAssignment() != null && s.getCoachAssignment().getCoach() != null && effCoachId.equals(s.getCoachAssignment().getCoach().getId())))
                .filter(s -> effAthleteId == null || (s.getCoachAssignment() != null && s.getCoachAssignment().getAthlete() != null && effAthleteId.equals(s.getCoachAssignment().getAthlete().getId())))
                .collect(Collectors.toList());

        long todaySessions = allSessions.stream().filter(s -> s.getSessionDate() != null && s.getSessionDate().equals(today)).count();
        long upcomingSessions = allSessions.stream().filter(s -> s.getSessionDate() != null && s.getSessionDate().isAfter(today)).count();
        long completedSessions = allSessions.stream().filter(s -> s.getStatus() != null && s.getStatus() == TrainingSessionStatus.COMPLETED).count();
        long cancelledSessions = allSessions.stream().filter(s -> s.getStatus() != null && s.getStatus() == TrainingSessionStatus.CANCELLED).count();
        sessions.put("today", todaySessions);
        sessions.put("upcoming", upcomingSessions);
        sessions.put("completed", completedSessions);
        sessions.put("cancelled", cancelledSessions);
        stats.setTrainingSessions(sessions);

        // Attendance Stats
        Map<String, Object> attendance = new HashMap<>();
        List<com.athletehub.api.entity.TrainingAttendance> allAttendance = trainingAttendanceRepository.findAll().stream()
                .filter(a -> effOrgId == null || (a.getAthlete() != null && effOrgId.equals(a.getAthlete().getOrganizationId())))
                .filter(a -> effCoachId == null || (a.getTrainingSession() != null && a.getTrainingSession().getCoachAssignment() != null && a.getTrainingSession().getCoachAssignment().getCoach() != null && effCoachId.equals(a.getTrainingSession().getCoachAssignment().getCoach().getId())))
                .filter(a -> effAthleteId == null || (a.getAthlete() != null && effAthleteId.equals(a.getAthlete().getId())))
                .collect(Collectors.toList());

        long totalAttendance = allAttendance.size();
        long present = allAttendance.stream().filter(a -> a.getAttendanceStatus() != null && a.getAttendanceStatus() == AttendanceStatus.PRESENT).count();
        long absent = allAttendance.stream().filter(a -> a.getAttendanceStatus() != null && a.getAttendanceStatus() == AttendanceStatus.ABSENT).count();
        long late = allAttendance.stream().filter(a -> a.getAttendanceStatus() != null && a.getAttendanceStatus() == AttendanceStatus.LATE).count();
        long excused = allAttendance.stream().filter(a -> a.getAttendanceStatus() != null && a.getAttendanceStatus() == AttendanceStatus.EXCUSED).count();
        
        double percentage = totalAttendance > 0 ? ((double) (present + late) / totalAttendance) * 100 : 0.0;
        
        attendance.put("percentage", Math.round(percentage * 100.0) / 100.0);
        attendance.put("present", present);
        attendance.put("absent", absent);
        attendance.put("late", late);
        attendance.put("excused", excused);
        stats.setAttendance(attendance);

        // Coach Statistics
        Map<String, Object> coachStats = new HashMap<>();
        coachStats.put("sessionsConducted", completedSessions);
        coachStats.put("weeklyWorkload", upcomingSessions > 0 ? "Medium" : "Low");
        coachStats.put("monthlyWorkload", totalPlans > 0 ? "High" : "Low");
        stats.setCoachStatistics(coachStats);

        // Athlete Statistics
        Map<String, Object> athleteStats = new HashMap<>();
        athleteStats.put("sessionsAttended", present + late);
        athleteStats.put("missedSessions", absent);
        athleteStats.put("attendancePercentage", Math.round(percentage * 100.0) / 100.0);
        stats.setAthleteStatistics(athleteStats);

        return stats;
    }
}
