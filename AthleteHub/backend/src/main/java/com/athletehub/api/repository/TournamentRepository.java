package com.athletehub.api.repository;

import com.athletehub.api.entity.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

import com.athletehub.api.entity.enums.TournamentStatus;

@Repository
public interface TournamentRepository extends JpaRepository<Tournament, Integer>, JpaSpecificationExecutor<Tournament> {
    List<Tournament> findByEventId(Integer eventId);
    boolean existsByEventIdAndNameIgnoreCase(Integer eventId, String name);
    long countByStatus(TournamentStatus status);
}
