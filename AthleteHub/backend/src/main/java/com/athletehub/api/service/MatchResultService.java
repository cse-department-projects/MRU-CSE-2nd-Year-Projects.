package com.athletehub.api.service;

import com.athletehub.api.dto.MatchResultRequest;
import com.athletehub.api.entity.Athlete;
import com.athletehub.api.entity.Match;
import com.athletehub.api.entity.MatchResult;
import com.athletehub.api.entity.enums.Medal;
import com.athletehub.api.repository.AthleteRepository;
import com.athletehub.api.repository.MatchRepository;
import com.athletehub.api.repository.MatchResultRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MatchResultService {

    private final MatchResultRepository resultRepository;
    private final MatchRepository matchRepository;
    private final AthleteRepository athleteRepository;

    public MatchResultService(MatchResultRepository resultRepository, MatchRepository matchRepository, AthleteRepository athleteRepository) {
        this.resultRepository = resultRepository;
        this.matchRepository = matchRepository;
        this.athleteRepository = athleteRepository;
    }

    @Transactional
    public MatchResult addResult(MatchResultRequest request, Integer userId) throws Exception {
        Match match = matchRepository.findById(request.getMatchId())
                .orElseThrow(() -> new Exception("Match not found"));

        Athlete athlete = athleteRepository.findById(request.getAthleteId())
                .orElseThrow(() -> new Exception("Athlete not found"));

        if (resultRepository.existsByMatchIdAndAthleteId(match.getId(), athlete.getId())) {
            throw new Exception("One Result per Athlete per Match is allowed.");
        }

        if (request.getRank() != null) {
            validateUniqueRankInMatch(match.getId(), request.getRank(), null);
        }

        MatchResult result = new MatchResult();
        result.setMatch(match);
        result.setAthlete(athlete);
        result.setRank(request.getRank());
        result.setScore(request.getScore());
        result.setRemarks(request.getRemarks());
        result.setMedal(assignMedalAutomatically(request.getRank()));
        result.setCreatedBy(userId);
        result.setUpdatedBy(userId);

        result = resultRepository.save(result);
        result.setResultCode(String.format("RES%06d", result.getId()));
        return resultRepository.save(result);
    }

    @Transactional
    public MatchResult updateResult(Integer id, MatchResultRequest request, Integer userId, boolean isSuperAdmin) throws Exception {
        MatchResult result = resultRepository.findById(id).orElseThrow(() -> new Exception("Result not found"));

        if (request.getRank() != null) {
            validateUniqueRankInMatch(result.getMatch().getId(), request.getRank(), result.getId());
        }

        if (request.getRank() != null) {
            result.setRank(request.getRank());
            result.setMedal(assignMedalAutomatically(request.getRank()));
        }
        if (request.getScore() != null) {
            result.setScore(request.getScore());
        }
        if (request.getRemarks() != null) {
            result.setRemarks(request.getRemarks());
        }
        result.setUpdatedBy(userId);

        return resultRepository.save(result);
    }

    private void validateUniqueRankInMatch(Integer matchId, Integer rank, Integer excludeResultId) throws Exception {
        List<MatchResult> existing = resultRepository.findByMatchIdOrderByRankAsc(matchId);
        for (MatchResult mr : existing) {
            if (mr.getRank() != null && mr.getRank().equals(rank)) {
                if (excludeResultId == null || !mr.getId().equals(excludeResultId)) {
                    throw new Exception("Rankings must be unique per match.");
                }
            }
        }
    }

    private Medal assignMedalAutomatically(Integer rank) {
        if (rank == null) return Medal.NONE;
        return switch (rank) {
            case 1 -> Medal.GOLD;
            case 2 -> Medal.SILVER;
            case 3 -> Medal.BRONZE;
            default -> Medal.NONE;
        };
    }

    public List<MatchResult> getResultsByMatch(Integer matchId) {
        return resultRepository.findByMatchIdAndIsDeletedFalseOrderByRankAsc(matchId);
    }

    public List<MatchResult> getResultsByAthlete(Integer athleteId) {
        return resultRepository.findByAthleteIdAndIsDeletedFalseOrderByCreatedAtDesc(athleteId);
    }

    @Transactional
    public void deleteResult(Integer id, Integer userId, boolean isSuperAdmin) throws Exception {
        MatchResult result = resultRepository.findById(id).orElseThrow(() -> new Exception("Result not found"));
        if (!isSuperAdmin) {
            throw new Exception("Finalized Results can only be deleted by a Super Admin.");
        }
        result.setIsDeleted(true);
        result.setUpdatedBy(userId);
        resultRepository.save(result);
    }
}
