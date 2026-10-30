package com.example.demo.repository;

import com.example.demo.entity.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssessmentRepository extends JpaRepository<Assessment, Long> {

    List<Assessment> findByTeacherId(Long teacherId);

    List<Assessment> findBySubjectId(Long subjectId);

    List<Assessment> findByTeacherIdAndSubjectId(
            Long teacherId,
            Long subjectId
    );
}