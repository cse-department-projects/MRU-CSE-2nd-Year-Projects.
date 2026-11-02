package com.athletehub.api.service.impl;

import com.athletehub.api.dto.TrainingSessionDTO;
import com.athletehub.api.dto.TrainingSessionMapper;
import com.athletehub.api.dto.TrainingSessionRequest;
import com.athletehub.api.entity.CoachAssignment;
import com.athletehub.api.entity.TrainingPlan;
import com.athletehub.api.entity.TrainingSession;
import com.athletehub.api.entity.enums.SessionIntensity;
import com.athletehub.api.entity.enums.TrainingSessionStatus;
import com.athletehub.api.exception.ResourceNotFoundException;
import com.athletehub.api.repository.CoachAssignmentRepository;
import com.athletehub.api.repository.TrainingPlanRepository;
import com.athletehub.api.repository.TrainingSessionRepository;
import com.athletehub.api.service.TrainingSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class TrainingSessionServiceImpl implements TrainingSessionService {

    @Autowired
    private TrainingSessionRepository trainingSessionRepository;

    @Autowired
    private TrainingPlanRepository trainingPlanRepository;

    @Autowired
    private CoachAssignmentRepository coachAssignmentRepository;

    @Autowired
    private TrainingSessionMapper trainingSessionMapper;

    @Autowired
    private com.athletehub.api.repository.TeamRepository teamRepository;

    @Autowired
    private com.athletehub.api.repository.TeamMemberRepository teamMemberRepository;

    @Autowired
    private com.athletehub.api.security.TenantSecurityService tenantSecurityService;

    @Override
    @Transactional
    public TrainingSessionDTO createTrainingSession(TrainingSessionRequest request) {
        if (request.getEndTime().isBefore(request.getStartTime()) || request.getEndTime().equals(request.getStartTime())) {
            throw new IllegalArgumentException("End Time must be after Start Time");
        }

        TrainingPlan plan = trainingPlanRepository.findById(request.getTrainingPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Training Plan not found"));
        tenantSecurityService.validateSameOrganization(plan.getOrganization().getId(), "Training Plan");

        com.athletehub.api.entity.Team team = null;
        if (request.getTeamId() != null) {
            team = teamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
            tenantSecurityService.validateSameOrganization(team.getOrganization().getId(), "Team");
        }

        CoachAssignment assignment = null;
        if (request.getCoachAssignmentId() != null) {
            assignment = coachAssignmentRepository.findById(request.getCoachAssignmentId()).orElse(null);
            if (assignment != null) {
                tenantSecurityService.validateSameOrganization(assignment.getOrganization().getId(), "Coach Assignment");
            }
        }

        if (team == null && assignment == null) {
            throw new IllegalArgumentException("Please select a Team / Squad for the session");
        }

        if (tenantSecurityService.isCoach()) {
            com.athletehub.api.entity.Coach coach = tenantSecurityService.getCurrentCoach();
            if (coach != null) {
                if (assignment != null && assignment.getCoach() != null && !coach.getId().equals(assignment.getCoach().getId())) {
                    throw new org.springframework.security.access.AccessDeniedException("Access denied: Coaches can only schedule sessions for their own assignments.");
                }
            }
        }

        TrainingSession session = new TrainingSession();
        session.setTrainingPlan(plan);
        session.setTeam(team);
        session.setCoachAssignment(assignment);
        session.setTitle(request.getTitle());
        session.setDescription(request.getDescription());
        session.setSessionDate(request.getSessionDate());
        session.setStartTime(request.getStartTime());
        session.setEndTime(request.getEndTime());
        session.setVenue(request.getVenue());
        session.setSessionType(request.getSessionType());
        
        if (request.getIntensity() != null) {
            session.setIntensity(SessionIntensity.valueOf(request.getIntensity().toUpperCase()));
        }
        
        if (request.getStatus() != null) {
            session.setStatus(TrainingSessionStatus.valueOf(request.getStatus().toUpperCase()));
        }

        // Save to get ID
        TrainingSession savedSession = trainingSessionRepository.save(session);
        
        // Generate code
        savedSession.setSessionCode("TSN" + String.format("%06d", savedSession.getId()));
        savedSession = trainingSessionRepository.save(savedSession);
        
        return trainingSessionMapper.toDTO(savedSession);
    }

    private void validateSessionAccess(TrainingSession session, boolean writeAccess) {
        if (tenantSecurityService.isSuperAdmin()) return;
        Integer userOrgId = tenantSecurityService.getCurrentUserOrganizationId();
        Integer sessionOrgId = null;
        if (session.getTrainingPlan() != null && session.getTrainingPlan().getOrganization() != null) {
            sessionOrgId = session.getTrainingPlan().getOrganization().getId();
        } else if (session.getTeam() != null && session.getTeam().getOrganization() != null) {
            sessionOrgId = session.getTeam().getOrganization().getId();
        }
        if (userOrgId == null || sessionOrgId == null || !userOrgId.equals(sessionOrgId)) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: Session belongs to a different organization.");
        }
        if (tenantSecurityService.isCoach()) {
            // coaches in organization have view access
        } else if (tenantSecurityService.isAthlete()) {
            if (writeAccess) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied: Athletes cannot modify training sessions.");
            }
            com.athletehub.api.entity.Athlete athlete = tenantSecurityService.getCurrentAthlete();
            if (athlete != null) {
                boolean hasAccess = false;
                if (session.getTeam() != null) {
                    hasAccess = teamMemberRepository.existsByTeamIdAndAthleteId(session.getTeam().getId(), athlete.getId());
                }
                if (!hasAccess && session.getCoachAssignment() != null && session.getCoachAssignment().getAthlete() != null) {
                    hasAccess = athlete.getId().equals(session.getCoachAssignment().getAthlete().getId());
                }
                if (!hasAccess) {
                    throw new org.springframework.security.access.AccessDeniedException("Access denied: Athlete is not assigned to this session.");
                }
            }
        }
    }

    @Override
    @Transactional
    public TrainingSessionDTO updateTrainingSession(Integer id, TrainingSessionRequest request) {
        TrainingSession session = trainingSessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Training Session not found"));
        validateSessionAccess(session, true);

        if (session.getStatus() == TrainingSessionStatus.COMPLETED) {
            // Can only update remarks
            if (request.getRemarks() != null) {
                session.setRemarks(request.getRemarks());
            } else {
                throw new IllegalArgumentException("Completed sessions cannot be modified except remarks");
            }
            return trainingSessionMapper.toDTO(trainingSessionRepository.save(session));
        }

        if (request.getStartTime() != null && request.getEndTime() != null) {
            if (request.getEndTime().isBefore(request.getStartTime()) || request.getEndTime().equals(request.getStartTime())) {
                throw new IllegalArgumentException("End Time must be after Start Time");
            }
            session.setStartTime(request.getStartTime());
            session.setEndTime(request.getEndTime());
            
            // Re-check overlap if times/dates change
            LocalDate dateToCheck = request.getSessionDate() != null ? request.getSessionDate() : session.getSessionDate();
            if (session.getCoachAssignment() != null) {
                List<TrainingSession> existingSessions = trainingSessionRepository.findByCoachAssignmentIdAndSessionDate(session.getCoachAssignment().getId(), dateToCheck);
                for (TrainingSession existing : existingSessions) {
                    if (!existing.getId().equals(session.getId()) && existing.getStatus() != TrainingSessionStatus.CANCELLED) {
                        boolean overlap = session.getStartTime().isBefore(existing.getEndTime()) && session.getEndTime().isAfter(existing.getStartTime());
                        if (overlap) {
                            throw new IllegalArgumentException("Session overlaps with another session for the same Coach Assignment");
                        }
                    }
                }
            }
        }

        if (request.getTeamId() != null) {
            com.athletehub.api.entity.Team team = teamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
            session.setTeam(team);
        }
        if (request.getTitle() != null) session.setTitle(request.getTitle());
        if (request.getDescription() != null) session.setDescription(request.getDescription());
        if (request.getSessionDate() != null) session.setSessionDate(request.getSessionDate());
        if (request.getVenue() != null) session.setVenue(request.getVenue());
        if (request.getSessionType() != null) session.setSessionType(request.getSessionType());
        if (request.getIntensity() != null) session.setIntensity(SessionIntensity.valueOf(request.getIntensity().toUpperCase()));
        if (request.getStatus() != null) session.setStatus(TrainingSessionStatus.valueOf(request.getStatus().toUpperCase()));
        if (request.getRemarks() != null) session.setRemarks(request.getRemarks());

        return trainingSessionMapper.toDTO(trainingSessionRepository.save(session));
    }

    @Override
    public TrainingSessionDTO getTrainingSessionById(Integer id) {
        TrainingSession session = trainingSessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Training Session not found"));
        validateSessionAccess(session, false);
        return trainingSessionMapper.toDTO(session);
    }

    @Override
    @Transactional
    public void deleteTrainingSession(Integer id) {
        TrainingSession session = trainingSessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Training Session not found"));
        validateSessionAccess(session, true);
        session.setStatus(TrainingSessionStatus.CANCELLED);
        trainingSessionRepository.save(session);
    }

    @Override
    public Page<TrainingSessionDTO> searchTrainingSessions(String search, Integer organizationId, Integer coachId, Integer athleteId, Integer teamId, Integer trainingPlanId, LocalDate startDate, LocalDate endDate, String status, String intensity, Pageable pageable) {
        final Integer effectiveOrgId = tenantSecurityService.getEffectiveOrganizationFilter(organizationId);
        Specification<TrainingSession> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (effectiveOrgId != null) {
                predicates.add(cb.equal(root.get("trainingPlan").get("organization").get("id"), effectiveOrgId));
            }
            
            if (search != null && !search.isEmpty()) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                Predicate titlePredicate = cb.like(cb.lower(root.get("title")), searchPattern);
                Predicate codePredicate = cb.like(cb.lower(root.get("sessionCode")), searchPattern);
                Predicate venuePredicate = cb.like(cb.lower(root.get("venue")), searchPattern);
                predicates.add(cb.or(titlePredicate, codePredicate, venuePredicate));
            }
            
            if (trainingPlanId != null) {
                predicates.add(cb.equal(root.get("trainingPlan").get("id"), trainingPlanId));
            }

            if (teamId != null) {
                predicates.add(cb.equal(root.get("team").get("id"), teamId));
            }
            
            if (organizationId != null || coachId != null || athleteId != null) {
                Join<TrainingSession, CoachAssignment> assignmentJoin = root.join("coachAssignment", jakarta.persistence.criteria.JoinType.LEFT);
                Join<TrainingSession, com.athletehub.api.entity.Team> teamJoin = root.join("team", jakarta.persistence.criteria.JoinType.LEFT);

                if (organizationId != null) {
                    predicates.add(cb.or(
                        cb.equal(assignmentJoin.get("organization").get("id"), organizationId),
                        cb.equal(teamJoin.get("organization").get("id"), organizationId),
                        cb.equal(root.get("trainingPlan").get("organization").get("id"), organizationId)
                    ));
                }
                if (coachId != null) {
                    predicates.add(cb.or(
                        cb.equal(assignmentJoin.get("coach").get("id"), coachId),
                        cb.equal(teamJoin.get("coach").get("id"), coachId)
                    ));
                }
                if (athleteId != null) {
                    jakarta.persistence.criteria.Subquery<Integer> subquery = query.subquery(Integer.class);
                    jakarta.persistence.criteria.Root<com.athletehub.api.entity.TeamMember> tmRoot = subquery.from(com.athletehub.api.entity.TeamMember.class);
                    subquery.select(tmRoot.get("team").get("id"))
                            .where(cb.equal(tmRoot.get("athlete").get("id"), athleteId));
                    predicates.add(cb.or(
                        cb.equal(assignmentJoin.get("athlete").get("id"), athleteId),
                        cb.in(root.get("team").get("id")).value(subquery)
                    ));
                }
            }
            
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("sessionDate"), startDate));
            }
            
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("sessionDate"), endDate));
            }
            
            if (status != null && !status.isEmpty()) {
                predicates.add(cb.equal(root.get("status"), TrainingSessionStatus.valueOf(status.toUpperCase())));
            }
            
            if (intensity != null && !intensity.isEmpty()) {
                predicates.add(cb.equal(root.get("intensity"), SessionIntensity.valueOf(intensity.toUpperCase())));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        
        return trainingSessionRepository.findAll(spec, pageable).map(trainingSessionMapper::toDTO);
    }
}
