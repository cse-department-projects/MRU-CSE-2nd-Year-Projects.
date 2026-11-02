package com.athletehub.api.service.impl;

import com.athletehub.api.dto.TrainingAttendanceDTO;
import com.athletehub.api.dto.TrainingAttendanceMapper;
import com.athletehub.api.dto.TrainingAttendanceRequest;
import com.athletehub.api.entity.Athlete;
import com.athletehub.api.entity.TrainingAttendance;
import com.athletehub.api.entity.TrainingSession;
import com.athletehub.api.entity.enums.AttendanceStatus;
import com.athletehub.api.entity.enums.TrainingSessionStatus;
import com.athletehub.api.exception.ResourceNotFoundException;
import com.athletehub.api.repository.AthleteRepository;
import com.athletehub.api.repository.TrainingAttendanceRepository;
import com.athletehub.api.repository.TrainingSessionRepository;
import com.athletehub.api.service.TrainingAttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class TrainingAttendanceServiceImpl implements TrainingAttendanceService {

    @Autowired
    private TrainingAttendanceRepository trainingAttendanceRepository;

    @Autowired
    private TrainingSessionRepository trainingSessionRepository;

    @Autowired
    private AthleteRepository athleteRepository;

    @Autowired
    private TrainingAttendanceMapper trainingAttendanceMapper;

    @Autowired
    private com.athletehub.api.service.TrainingSessionService trainingSessionService;

    @Autowired
    private com.athletehub.api.security.TenantSecurityService tenantSecurityService;

    @Override
    @Transactional
    public TrainingAttendanceDTO recordAttendance(TrainingAttendanceRequest request) {
        TrainingSession session = trainingSessionRepository.findById(request.getTrainingSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Training Session not found"));

        if (session.getStatus() == TrainingSessionStatus.CANCELLED) {
            throw new IllegalArgumentException("Cancelled sessions cannot record attendance");
        }

        Athlete athlete = athleteRepository.findById(request.getAthleteId())
                .orElseThrow(() -> new ResourceNotFoundException("Athlete not found"));

        if (session.getTeam() != null) {
            tenantSecurityService.validateAthleteInCurrentOrg(athlete);
        } else {
            tenantSecurityService.validateAthleteAccess(athlete);
        }

        if (tenantSecurityService.isCoach()) {
            com.athletehub.api.entity.Coach coach = tenantSecurityService.getCurrentCoach();
            if (coach == null) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied: Coach profile not found.");
            }
            if (session.getCoachAssignment() != null && session.getCoachAssignment().getCoach() != null &&
                    !coach.getId().equals(session.getCoachAssignment().getCoach().getId())) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied: Coach is not assigned to this session.");
            }
            if (session.getTeam() != null && session.getTeam().getCoach() != null &&
                    !coach.getId().equals(session.getTeam().getCoach().getId())) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied: Coach is not assigned to this team.");
            }
        }

        if (session.getTeam() != null) {
            // Team session: athlete organization access already validated
        } else if (session.getCoachAssignment() != null && session.getCoachAssignment().getAthlete() != null) {
            if (!session.getCoachAssignment().getAthlete().getId().equals(athlete.getId())) {
                throw new IllegalArgumentException("Athlete must belong to the assigned Coach for this session");
            }
        }

        Optional<TrainingAttendance> existing = trainingAttendanceRepository.findByTrainingSessionIdAndAthleteId(session.getId(), athlete.getId());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Attendance cannot be submitted twice for the same athlete and session. Update existing record instead.");
        }

        TrainingAttendance attendance = new TrainingAttendance();
        attendance.setTrainingSession(session);
        attendance.setAthlete(athlete);
        attendance.setAttendanceStatus(AttendanceStatus.valueOf(request.getAttendanceStatus().toUpperCase()));
        attendance.setCoachNotes(request.getCoachNotes());
        attendance.setAthleteFeedback(request.getAthleteFeedback());
        attendance.setInjuryReport(request.getInjuryReport());

        // Save to get ID
        TrainingAttendance savedAttendance = trainingAttendanceRepository.save(attendance);
        
        // Generate code
        savedAttendance.setAttendanceCode("ATD" + String.format("%06d", savedAttendance.getId()));
        savedAttendance = trainingAttendanceRepository.save(savedAttendance);
        
        return trainingAttendanceMapper.toDTO(savedAttendance);
    }

    @Override
    @Transactional
    public TrainingAttendanceDTO updateAttendance(Integer id, TrainingAttendanceRequest request) {
        TrainingAttendance attendance = trainingAttendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found"));
        if (attendance.getTrainingSession() != null && attendance.getTrainingSession().getTeam() != null) {
            tenantSecurityService.validateAthleteInCurrentOrg(attendance.getAthlete());
        } else {
            tenantSecurityService.validateAthleteAccess(attendance.getAthlete());
        }

        if (request.getAttendanceStatus() != null) {
            attendance.setAttendanceStatus(AttendanceStatus.valueOf(request.getAttendanceStatus().toUpperCase()));
        }
        if (request.getCoachNotes() != null) attendance.setCoachNotes(request.getCoachNotes());
        if (request.getAthleteFeedback() != null) attendance.setAthleteFeedback(request.getAthleteFeedback());
        if (request.getInjuryReport() != null) attendance.setInjuryReport(request.getInjuryReport());

        return trainingAttendanceMapper.toDTO(trainingAttendanceRepository.save(attendance));
    }

    @Override
    public TrainingAttendanceDTO getAttendanceById(Integer id) {
        TrainingAttendance attendance = trainingAttendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found"));
        if (attendance.getTrainingSession() != null && attendance.getTrainingSession().getTeam() != null) {
            tenantSecurityService.validateAthleteInCurrentOrg(attendance.getAthlete());
        } else {
            tenantSecurityService.validateAthleteAccess(attendance.getAthlete());
        }
        return trainingAttendanceMapper.toDTO(attendance);
    }

    @Override
    public Page<TrainingAttendanceDTO> getAttendanceBySessionId(Integer sessionId, Pageable pageable) {
        TrainingSession session = trainingSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Training Session not found"));
        if (session.getTrainingPlan() != null && session.getTrainingPlan().getOrganization() != null) {
            tenantSecurityService.validateSameOrganization(session.getTrainingPlan().getOrganization().getId(), "Training Session");
        }
        if (tenantSecurityService.isCoach()) {
            com.athletehub.api.entity.Coach coach = tenantSecurityService.getCurrentCoach();
            if (coach == null) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied: Coach profile not found.");
            }
            if (session.getCoachAssignment() != null && session.getCoachAssignment().getCoach() != null &&
                    !coach.getId().equals(session.getCoachAssignment().getCoach().getId())) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied: Not your session.");
            }
        } else if (tenantSecurityService.isAthlete()) {
            com.athletehub.api.entity.Athlete athlete = tenantSecurityService.getCurrentAthlete();
            if (athlete == null) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied: Athlete profile not found.");
            }
            if (session.getCoachAssignment() != null && session.getCoachAssignment().getAthlete() != null &&
                    !athlete.getId().equals(session.getCoachAssignment().getAthlete().getId())) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied: Not your session.");
            }
        }
        return trainingAttendanceRepository.findAll(
                (root, query, cb) -> cb.equal(root.get("trainingSession").get("id"), sessionId),
                pageable
        ).map(trainingAttendanceMapper::toDTO);
    }

    @Override
    public Page<TrainingAttendanceDTO> getAttendanceByAthleteId(Integer athleteId, Pageable pageable) {
        Athlete athlete = athleteRepository.findById(athleteId)
                .orElseThrow(() -> new ResourceNotFoundException("Athlete not found"));
        tenantSecurityService.validateAthleteAccess(athlete);
        return trainingAttendanceRepository.findAll(
                (root, query, cb) -> cb.equal(root.get("athlete").get("id"), athleteId),
                pageable
        ).map(trainingAttendanceMapper::toDTO);
    }

    @Override
    public Page<com.athletehub.api.dto.SessionAttendanceSummaryDTO> getSessionsAttendanceOverview(
            Integer teamId, String status, java.time.LocalDate startDate, java.time.LocalDate endDate, Pageable pageable) {

        Integer coachId = null;
        if (tenantSecurityService.isCoach()) {
            com.athletehub.api.entity.Coach coach = tenantSecurityService.getCurrentCoach();
            if (coach != null) {
                coachId = coach.getId();
            }
        }

        Page<com.athletehub.api.dto.TrainingSessionDTO> sessionsPage =
                trainingSessionService.searchTrainingSessions(
                        null, null, coachId, null, teamId, null, startDate, endDate, status, null, pageable);

        return sessionsPage.map(s -> {
            com.athletehub.api.dto.SessionAttendanceSummaryDTO summary = new com.athletehub.api.dto.SessionAttendanceSummaryDTO();
            summary.setSessionId(s.getId());
            summary.setSessionCode(s.getSessionCode());
            summary.setTitle(s.getTitle());
            summary.setTeamId(s.getTeamId());
            summary.setTeamName(s.getTeamName());
            summary.setTrainingPlanId(s.getTrainingPlanId());
            summary.setTrainingPlanTitle(s.getTrainingPlanTitle());
            summary.setCoachName(s.getCoachName());
            summary.setSessionDate(s.getSessionDate());
            summary.setStartTime(s.getStartTime());
            summary.setEndTime(s.getEndTime());
            summary.setVenue(s.getVenue());
            summary.setStatus(s.getStatus());
            summary.setIntensity(s.getIntensity());

            java.util.List<TrainingAttendance> records = trainingAttendanceRepository.findAll(
                    (root, query, cb) -> cb.equal(root.get("trainingSession").get("id"), s.getId())
            );

            long total = records.size();
            long present = records.stream().filter(r -> r.getAttendanceStatus() == AttendanceStatus.PRESENT).count();
            long late = records.stream().filter(r -> r.getAttendanceStatus() == AttendanceStatus.LATE).count();
            long excused = records.stream().filter(r -> r.getAttendanceStatus() == AttendanceStatus.EXCUSED).count();
            long absent = records.stream().filter(r -> r.getAttendanceStatus() == AttendanceStatus.ABSENT).count();

            summary.setTotalRecorded(total);
            summary.setPresentCount(present);
            summary.setLateCount(late);
            summary.setExcusedCount(excused);
            summary.setAbsentCount(absent);
            summary.setAttendanceRate(total > 0 ? (((double)(present + late)) / total) * 100.0 : 0.0);
            summary.setRecords(records.stream().map(trainingAttendanceMapper::toDTO).collect(java.util.stream.Collectors.toList()));

            return summary;
        });
    }
}
