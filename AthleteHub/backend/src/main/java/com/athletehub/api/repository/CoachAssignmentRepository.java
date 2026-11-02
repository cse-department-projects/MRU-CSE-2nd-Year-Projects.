package com.athletehub.api.repository;

import com.athletehub.api.entity.CoachAssignment;
import com.athletehub.api.entity.enums.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CoachAssignmentRepository extends JpaRepository<CoachAssignment, Integer>, JpaSpecificationExecutor<CoachAssignment> {
    
    long countByStatus(AssignmentStatus status);
    
    boolean existsByCoachIdAndAthleteIdAndStatus(Integer coachId, Integer athleteId, AssignmentStatus status);

    @Query("SELECT COUNT(DISTINCT ca.athlete.id) FROM CoachAssignment ca WHERE ca.status = :status")
    long countDistinctAthletesByStatus(@Param("status") AssignmentStatus status);

    @Query("SELECT COUNT(DISTINCT ca.coach.id) FROM CoachAssignment ca WHERE ca.status = :status")
    long countDistinctCoachesByStatus(@Param("status") AssignmentStatus status);
    
    List<CoachAssignment> findByCoachId(Integer coachId);
    
    List<CoachAssignment> findByAthleteId(Integer athleteId);
}
