package com.athletehub.api.service;

import com.athletehub.api.dto.RankingHistoryRequestDTO;
import com.athletehub.api.dto.RankingHistoryResponseDTO;
import com.athletehub.api.entity.Athlete;
import com.athletehub.api.entity.RankingHistory;
import com.athletehub.api.entity.Sport;
import com.athletehub.api.exception.ResourceNotFoundException;
import com.athletehub.api.repository.AthleteRepository;
import com.athletehub.api.repository.RankingHistoryRepository;
import com.athletehub.api.repository.SportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RankingHistoryService {

    @Autowired
    private RankingHistoryRepository rankingRepository;

    @Autowired
    private AthleteRepository athleteRepository;

    @Autowired
    private SportRepository sportRepository;

    @Autowired
    private com.athletehub.api.security.TenantSecurityService tenantSecurityService;

    @Transactional
    public RankingHistoryResponseDTO recordRanking(RankingHistoryRequestDTO request, Integer currentUserId) {
        RankingHistory ranking = new RankingHistory();
        
        Athlete athlete = athleteRepository.findById(request.getAthleteId())
                .orElseThrow(() -> new ResourceNotFoundException("Athlete not found"));
        tenantSecurityService.validateAthleteAccess(athlete);
                
        ranking.setAthlete(athlete);
        ranking.setCategory(request.getCategory());
        ranking.setRankPosition(request.getRankPosition());
        ranking.setScore(request.getScore());
        ranking.setDateRecorded(request.getDateRecorded());
        
        if (request.getSportId() != null) {
            Sport sport = sportRepository.findById(request.getSportId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sport not found"));
            ranking.setSport(sport);
        }
        
        ranking.setCreatedBy(currentUserId);
        ranking.setUpdatedBy(currentUserId);
        
        ranking = rankingRepository.save(ranking);
        return mapToDTO(ranking);
    }

    public Page<RankingHistoryResponseDTO> getRankingHistoryByAthlete(Integer athleteId, Pageable pageable) {
        Athlete athlete = athleteRepository.findById(athleteId)
                .orElseThrow(() -> new ResourceNotFoundException("Athlete not found"));
        tenantSecurityService.validateAthleteAccess(athlete);
        return rankingRepository.findByAthleteIdAndIsDeletedFalse(athleteId, pageable)
                .map(this::mapToDTO);
    }

    private RankingHistoryResponseDTO mapToDTO(RankingHistory ranking) {
        RankingHistoryResponseDTO dto = new RankingHistoryResponseDTO();
        dto.setId(ranking.getId());
        dto.setAthleteId(ranking.getAthlete().getId());
        dto.setAthleteName(ranking.getAthlete().getFirstName() + " " + ranking.getAthlete().getLastName());
        
        if (ranking.getSport() != null) {
            dto.setSportId(ranking.getSport().getId());
            dto.setSportName(ranking.getSport().getName());
        }
        
        dto.setCategory(ranking.getCategory());
        dto.setRankPosition(ranking.getRankPosition());
        dto.setScore(ranking.getScore());
        dto.setDateRecorded(ranking.getDateRecorded());
        
        return dto;
    }
}
