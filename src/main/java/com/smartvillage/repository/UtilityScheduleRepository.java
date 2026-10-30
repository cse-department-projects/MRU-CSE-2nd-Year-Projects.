package com.smartvillage.repository;

import com.smartvillage.model.UtilitySchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UtilityScheduleRepository extends JpaRepository<UtilitySchedule, Long> {
    List<UtilitySchedule> findAllByOrderByCreatedAtDesc();
    List<UtilitySchedule> findByUtilityType(String utilityType);
}
