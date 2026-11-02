package com.athletehub.api.repository;

import com.athletehub.api.entity.WellnessCheckIn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WellnessCheckInRepository extends JpaRepository<WellnessCheckIn, Integer> {
    
    Optional<WellnessCheckIn> findByAthleteIdAndDate(Integer athleteId, LocalDate date);
    
    List<WellnessCheckIn> findByAthleteIdAndDateBetweenOrderByDateAsc(Integer athleteId, LocalDate startDate, LocalDate endDate);
    
}
