package com.athletehub.api.repository;

import com.athletehub.api.entity.PerformanceRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PerformanceRecordRepository extends JpaRepository<PerformanceRecord, Integer> {

    Optional<PerformanceRecord> findByRecordCodeAndIsDeletedFalse(String recordCode);

    Page<PerformanceRecord> findByAthleteIdAndIsDeletedFalse(Integer athleteId, Pageable pageable);

    @Query("SELECT p FROM PerformanceRecord p WHERE p.athlete.id = :athleteId AND p.metricName = :metricName AND p.isDeleted = false ORDER BY p.recordDate DESC")
    List<PerformanceRecord> findByAthleteAndMetricName(@Param("athleteId") Integer athleteId, @Param("metricName") String metricName);

    @Query("SELECT p FROM PerformanceRecord p WHERE p.athlete.id = :athleteId AND p.metricName = :metricName AND p.isPersonalBest = true AND p.isDeleted = false")
    Optional<PerformanceRecord> findPersonalBest(@Param("athleteId") Integer athleteId, @Param("metricName") String metricName);
}
