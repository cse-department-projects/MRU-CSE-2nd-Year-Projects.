package com.athletehub.api.repository;

import com.athletehub.api.entity.TrainingPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrainingPlanRepository extends JpaRepository<TrainingPlan, Integer>, JpaSpecificationExecutor<TrainingPlan> {
    Optional<TrainingPlan> findByPlanCode(String planCode);
}
