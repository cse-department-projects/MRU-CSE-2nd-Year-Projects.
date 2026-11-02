package com.athletehub.api.repository;

import com.athletehub.api.entity.CoachEvaluation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CoachEvaluationRepository extends JpaRepository<CoachEvaluation, Integer> {

    Optional<CoachEvaluation> findByEvaluationCodeAndIsDeletedFalse(String evaluationCode);

    Page<CoachEvaluation> findByCoachIdAndIsDeletedFalse(Integer coachId, Pageable pageable);
}
