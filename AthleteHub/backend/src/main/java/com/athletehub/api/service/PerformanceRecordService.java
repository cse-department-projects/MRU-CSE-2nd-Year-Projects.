package com.athletehub.api.service;

import com.athletehub.api.dto.PerformanceRecordRequestDTO;
import com.athletehub.api.dto.PerformanceRecordResponseDTO;
import com.athletehub.api.entity.*;
import com.athletehub.api.entity.enums.RecordContext;
import com.athletehub.api.exception.ResourceNotFoundException;
import com.athletehub.api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class PerformanceRecordService {

    @Autowired
    private PerformanceRecordRepository performanceRecordRepository;

    @Autowired
    private AthleteRepository athleteRepository;

    @Autowired
    private SportRepository sportRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private TrainingSessionRepository trainingSessionRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.athletehub.api.security.TenantSecurityService tenantSecurityService;

    @Transactional
    public PerformanceRecordResponseDTO createRecord(PerformanceRecordRequestDTO request, Integer currentUserId) {
        PerformanceRecord record = new PerformanceRecord();
        
        Athlete athlete = athleteRepository.findById(request.getAthleteId())
                .orElseThrow(() -> new ResourceNotFoundException("Athlete not found"));
        tenantSecurityService.validateAthleteAccess(athlete);
        record.setAthlete(athlete);
        
        record.setRecordCode("PR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        record.setMetricName(request.getMetricName());
        record.setMetricValue(request.getMetricValue());
        record.setUnit(request.getUnit());
        record.setRecordDate(request.getRecordDate());
        record.setContext(request.getContext() != null ? RecordContext.valueOf(request.getContext()) : RecordContext.GENERAL);
        record.setHigherIsBetter(request.getHigherIsBetter() != null ? request.getHigherIsBetter() : true);
        record.setNotes(request.getNotes());
        record.setCreatedBy(currentUserId);
        record.setUpdatedBy(currentUserId);

        // Map optional relationships
        if (request.getSportId() != null) {
            record.setSport(sportRepository.findById(request.getSportId()).orElse(null));
        }
        if (request.getRelatedMatchId() != null) {
            record.setRelatedMatch(matchRepository.findById(request.getRelatedMatchId()).orElse(null));
        }
        if (request.getRelatedTrainingSessionId() != null) {
            record.setRelatedTrainingSession(trainingSessionRepository.findById(request.getRelatedTrainingSessionId()).orElse(null));
        }
        if (request.getRelatedEventId() != null) {
            record.setRelatedEvent(eventRepository.findById(request.getRelatedEventId()).orElse(null));
        }

        // Handle verification
        if (Boolean.TRUE.equals(request.getIsVerified()) && request.getVerifiedById() != null) {
            User verifier = userRepository.findById(request.getVerifiedById()).orElse(null);
            if (verifier != null) {
                record.setIsVerified(true);
                record.setVerifiedBy(verifier);
                record.setVerifiedAt(java.time.LocalDateTime.now());
            }
        }

        // PB Logic
        updatePersonalBest(record);

        record = performanceRecordRepository.save(record);
        return mapToDTO(record);
    }

    private void updatePersonalBest(PerformanceRecord newRecord) {
        Optional<PerformanceRecord> currentPbOpt = performanceRecordRepository.findPersonalBest(
                newRecord.getAthlete().getId(), newRecord.getMetricName());

        if (currentPbOpt.isEmpty()) {
            // First record for this metric is always the PB
            newRecord.setIsPersonalBest(true);
            return;
        }

        PerformanceRecord currentPb = currentPbOpt.get();
        boolean isNewPb = false;

        if (newRecord.getHigherIsBetter()) {
            if (newRecord.getMetricValue() > currentPb.getMetricValue()) {
                isNewPb = true;
            }
        } else {
            if (newRecord.getMetricValue() < currentPb.getMetricValue()) {
                isNewPb = true;
            }
        }

        if (isNewPb) {
            currentPb.setIsPersonalBest(false);
            performanceRecordRepository.save(currentPb);
            newRecord.setIsPersonalBest(true);
        } else {
            newRecord.setIsPersonalBest(false);
        }
    }

    public Page<PerformanceRecordResponseDTO> getRecordsByAthlete(Integer athleteId, Pageable pageable) {
        Athlete athlete = athleteRepository.findById(athleteId)
                .orElseThrow(() -> new ResourceNotFoundException("Athlete not found"));
        tenantSecurityService.validateAthleteAccess(athlete);
        return performanceRecordRepository.findByAthleteIdAndIsDeletedFalse(athleteId, pageable)
                .map(this::mapToDTO);
    }

    private PerformanceRecordResponseDTO mapToDTO(PerformanceRecord record) {
        PerformanceRecordResponseDTO dto = new PerformanceRecordResponseDTO();
        dto.setId(record.getId());
        dto.setRecordCode(record.getRecordCode());
        dto.setAthleteId(record.getAthlete().getId());
        dto.setAthleteName(record.getAthlete().getFirstName() + " " + record.getAthlete().getLastName());
        
        if (record.getSport() != null) {
            dto.setSportId(record.getSport().getId());
            dto.setSportName(record.getSport().getName());
        }
        
        dto.setMetricName(record.getMetricName());
        dto.setMetricValue(record.getMetricValue());
        dto.setUnit(record.getUnit());
        dto.setRecordDate(record.getRecordDate());
        dto.setContext(record.getContext().name());
        
        if (record.getRelatedMatch() != null) dto.setRelatedMatchId(record.getRelatedMatch().getId());
        if (record.getRelatedTrainingSession() != null) dto.setRelatedTrainingSessionId(record.getRelatedTrainingSession().getId());
        if (record.getRelatedEvent() != null) dto.setRelatedEventId(record.getRelatedEvent().getId());
        
        dto.setHigherIsBetter(record.getHigherIsBetter());
        dto.setIsPersonalBest(record.getIsPersonalBest());
        dto.setIsVerified(record.getIsVerified());
        
        if (record.getVerifiedBy() != null) {
            dto.setVerifiedById(record.getVerifiedBy().getId());
            dto.setVerifiedByName(record.getVerifiedBy().getFullName());
        }
        dto.setVerifiedAt(record.getVerifiedAt());
        dto.setNotes(record.getNotes());
        
        return dto;
    }
}
