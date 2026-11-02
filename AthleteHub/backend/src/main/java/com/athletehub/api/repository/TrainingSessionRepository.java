package com.athletehub.api.repository;

import com.athletehub.api.entity.TrainingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TrainingSessionRepository extends JpaRepository<TrainingSession, Integer>, JpaSpecificationExecutor<TrainingSession> {
    Optional<TrainingSession> findBySessionCode(String sessionCode);
    
    // Check for overlap for the same coach assignment
    List<TrainingSession> findByCoachAssignmentIdAndSessionDate(Integer coachAssignmentId, LocalDate sessionDate);
}
