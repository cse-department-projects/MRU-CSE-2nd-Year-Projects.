package com.athletehub.api.service;

import com.athletehub.api.dto.WellnessCheckInDTO;
import com.athletehub.api.entity.Athlete;
import com.athletehub.api.entity.WellnessCheckIn;
import com.athletehub.api.exception.ResourceNotFoundException;
import com.athletehub.api.repository.AthleteRepository;
import com.athletehub.api.repository.WellnessCheckInRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WellnessCheckInService {

    @Autowired
    private WellnessCheckInRepository wellnessRepository;

    @Autowired
    private AthleteRepository athleteRepository;

    @Autowired
    private com.athletehub.api.security.TenantSecurityService tenantSecurityService;

    @Transactional
    public WellnessCheckInDTO saveCheckIn(Integer athleteId, WellnessCheckInDTO dto) {
        Athlete athlete = athleteRepository.findById(athleteId)
                .orElseThrow(() -> new ResourceNotFoundException("Athlete not found with id: " + athleteId));
        tenantSecurityService.validateAthletePrivateAccess(athlete);

        WellnessCheckIn checkIn = wellnessRepository.findByAthleteIdAndDate(athleteId, dto.getDate())
                .orElse(new WellnessCheckIn());

        checkIn.setAthlete(athlete);
        checkIn.setDate(dto.getDate() != null ? dto.getDate() : LocalDate.now());
        checkIn.setSleepQuality(dto.getSleepQuality());
        checkIn.setSoreness(dto.getSoreness());
        checkIn.setStress(dto.getStress());
        checkIn.setRpe(dto.getRpe());
        checkIn.setNotes(dto.getNotes());

        WellnessCheckIn saved = wellnessRepository.save(checkIn);
        return mapToDTO(saved);
    }

    public WellnessCheckInDTO getCheckInByDate(Integer athleteId, LocalDate date) {
        Athlete athlete = athleteRepository.findById(athleteId)
                .orElseThrow(() -> new ResourceNotFoundException("Athlete not found with id: " + athleteId));
        tenantSecurityService.validateAthletePrivateAccess(athlete);

        WellnessCheckIn checkIn = wellnessRepository.findByAthleteIdAndDate(athleteId, date)
                .orElseThrow(() -> new ResourceNotFoundException("No check-in found for date: " + date));
        return mapToDTO(checkIn);
    }

    public List<WellnessCheckInDTO> getAthleteCheckIns(Integer athleteId, LocalDate startDate, LocalDate endDate) {
        Athlete athlete = athleteRepository.findById(athleteId)
                .orElseThrow(() -> new ResourceNotFoundException("Athlete not found with id: " + athleteId));
        tenantSecurityService.validateAthletePrivateAccess(athlete);

        List<WellnessCheckIn> checkIns = wellnessRepository.findByAthleteIdAndDateBetweenOrderByDateAsc(athleteId, startDate, endDate);
        return checkIns.stream().map(this::mapToDTO).collect(Collectors.toList());
    }
    
    public WellnessCheckInDTO calculateACWR(Integer athleteId) {
        Athlete athlete = athleteRepository.findById(athleteId)
                .orElseThrow(() -> new ResourceNotFoundException("Athlete not found with id: " + athleteId));
        tenantSecurityService.validateAthletePrivateAccess(athlete);

        LocalDate today = LocalDate.now();
        // Acute load = last 7 days average RPE
        List<WellnessCheckIn> acuteCheckIns = wellnessRepository.findByAthleteIdAndDateBetweenOrderByDateAsc(athleteId, today.minusDays(7), today);
        double acuteLoad = acuteCheckIns.stream().mapToInt(c -> c.getRpe() != null ? c.getRpe() : 0).average().orElse(0.0);
        
        // Chronic load = last 28 days average RPE
        List<WellnessCheckIn> chronicCheckIns = wellnessRepository.findByAthleteIdAndDateBetweenOrderByDateAsc(athleteId, today.minusDays(28), today);
        double chronicLoad = chronicCheckIns.stream().mapToInt(c -> c.getRpe() != null ? c.getRpe() : 0).average().orElse(0.0);
        
        double acwr = chronicLoad > 0 ? acuteLoad / chronicLoad : 0.0;
        
        WellnessCheckInDTO stats = new WellnessCheckInDTO();
        stats.setAthleteId(athleteId);
        stats.setAcuteLoad(Math.round(acuteLoad * 100.0) / 100.0);
        stats.setChronicLoad(Math.round(chronicLoad * 100.0) / 100.0);
        stats.setAcwr(Math.round(acwr * 100.0) / 100.0);
        
        return stats;
    }

    private WellnessCheckInDTO mapToDTO(WellnessCheckIn entity) {
        WellnessCheckInDTO dto = new WellnessCheckInDTO();
        dto.setId(entity.getId());
        dto.setAthleteId(entity.getAthlete().getId());
        dto.setDate(entity.getDate());
        dto.setSleepQuality(entity.getSleepQuality());
        dto.setSoreness(entity.getSoreness());
        dto.setStress(entity.getStress());
        dto.setRpe(entity.getRpe());
        dto.setNotes(entity.getNotes());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
