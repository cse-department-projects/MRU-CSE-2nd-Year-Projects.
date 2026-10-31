package com.roadsafety.repository;

import com.roadsafety.model.EmergencyAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmergencyAlertRepository extends JpaRepository<EmergencyAlert, Long> {
    List<EmergencyAlert> findAllByOrderByCreatedAtDesc();
    List<EmergencyAlert> findByAssignedHospitalIdOrderByCreatedAtDesc(Long hospitalId);
}
