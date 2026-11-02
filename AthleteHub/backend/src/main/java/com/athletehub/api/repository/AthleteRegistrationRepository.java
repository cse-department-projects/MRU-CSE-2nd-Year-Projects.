package com.athletehub.api.repository;

import com.athletehub.api.entity.AthleteRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.athletehub.api.entity.enums.RegistrationStatus;

@Repository
public interface AthleteRegistrationRepository extends JpaRepository<AthleteRegistration, Integer>, JpaSpecificationExecutor<AthleteRegistration> {
    boolean existsByAthleteIdAndTournamentId(Integer athleteId, Integer tournamentId);
    long countByTournamentId(Integer tournamentId);
    java.util.List<AthleteRegistration> findByTournamentId(Integer tournamentId);
    long countByStatus(RegistrationStatus status);
}
