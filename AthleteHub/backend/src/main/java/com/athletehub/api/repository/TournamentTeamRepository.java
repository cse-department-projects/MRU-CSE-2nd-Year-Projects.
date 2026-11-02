package com.athletehub.api.repository;

import com.athletehub.api.entity.TournamentTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TournamentTeamRepository extends JpaRepository<TournamentTeam, Integer> {

    Optional<TournamentTeam> findByIdAndIsDeletedFalse(Integer id);

    Optional<TournamentTeam> findByTournamentIdAndTeamIdAndIsDeletedFalse(Integer tournamentId, Integer teamId);

    boolean existsByTournamentIdAndTeamIdAndIsDeletedFalse(Integer tournamentId, Integer teamId);

    List<TournamentTeam> findByTournamentIdAndIsDeletedFalse(Integer tournamentId);

    long countByTournamentIdAndIsDeletedFalse(Integer tournamentId);

    @Query("SELECT tt FROM TournamentTeam tt " +
           "JOIN FETCH tt.team t " +
           "LEFT JOIN FETCH t.coach c " +
           "WHERE tt.tournament.id = :tournamentId " +
           "AND tt.isDeleted = false")
    List<TournamentTeam> findByTournamentIdWithTeamDetails(@Param("tournamentId") Integer tournamentId);
}
