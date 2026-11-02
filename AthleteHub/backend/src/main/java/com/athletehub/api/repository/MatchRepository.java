package com.athletehub.api.repository;

import com.athletehub.api.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.athletehub.api.entity.enums.MatchStatus;
import java.time.LocalDate;

@Repository
public interface MatchRepository extends JpaRepository<Match, Integer>, JpaSpecificationExecutor<Match> {
    long countByStatus(MatchStatus status);
    long countByMatchDate(LocalDate date);
    long countByTournamentId(Integer tournamentId);
    java.util.List<Match> findByTournamentId(Integer tournamentId);
}
