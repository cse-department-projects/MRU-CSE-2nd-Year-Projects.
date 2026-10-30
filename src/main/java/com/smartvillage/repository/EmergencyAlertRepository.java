package com.smartvillage.repository;

import com.smartvillage.model.EmergencyAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmergencyAlertRepository extends JpaRepository<EmergencyAlert, Long> {
    List<EmergencyAlert> findByActiveTrueOrderByBroadcastDateDesc();
    List<EmergencyAlert> findAllByOrderByBroadcastDateDesc();
}
