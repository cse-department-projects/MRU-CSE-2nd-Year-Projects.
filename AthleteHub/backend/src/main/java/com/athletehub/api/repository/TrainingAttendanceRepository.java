package com.athletehub.api.repository;

import com.athletehub.api.entity.TrainingAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrainingAttendanceRepository extends JpaRepository<TrainingAttendance, Integer>, JpaSpecificationExecutor<TrainingAttendance> {
    Optional<TrainingAttendance> findByAttendanceCode(String attendanceCode);
    
    // To check duplicate attendance
    Optional<TrainingAttendance> findByTrainingSessionIdAndAthleteId(Integer trainingSessionId, Integer athleteId);
}
