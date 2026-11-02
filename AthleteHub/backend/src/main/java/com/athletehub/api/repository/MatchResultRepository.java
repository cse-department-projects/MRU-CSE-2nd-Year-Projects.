package com.athletehub.api.repository;

import com.athletehub.api.entity.MatchResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import com.athletehub.api.entity.enums.Medal;

@Repository
public interface MatchResultRepository extends JpaRepository<MatchResult, Integer>, JpaSpecificationExecutor<MatchResult> {
    Optional<MatchResult> findByMatchIdAndAthleteId(Integer matchId, Integer athleteId);
    boolean existsByMatchIdAndAthleteId(Integer matchId, Integer athleteId);
    List<MatchResult> findByMatchIdOrderByRankAsc(Integer matchId);
    List<MatchResult> findByMatchIdAndIsDeletedFalseOrderByRankAsc(Integer matchId);
    long countByMedal(Medal medal);
    long countByMedalNot(Medal medal);
    List<MatchResult> findByAthleteIdAndIsDeletedFalseOrderByCreatedAtDesc(Integer athleteId);
}
