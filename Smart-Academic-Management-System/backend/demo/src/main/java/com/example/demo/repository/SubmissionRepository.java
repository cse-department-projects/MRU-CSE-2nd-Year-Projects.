package com.example.demo.repository;

import com.example.demo.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubmissionRepository
        extends JpaRepository<Submission, Long> {

    List<Submission> findByStudentId(Long studentId);

    List<Submission> findByAssessmentId(Long assessmentId);

    List<Submission> findByStudentIdAndAssessmentId(
            Long studentId,
            Long assessmentId
    );
}