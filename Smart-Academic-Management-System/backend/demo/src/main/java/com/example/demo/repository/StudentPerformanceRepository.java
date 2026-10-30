package com.example.demo.repository;

import com.example.demo.entity.StudentPerformance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentPerformanceRepository
        extends JpaRepository<StudentPerformance, Long> {

    Optional<StudentPerformance> findByStudentIdAndSubjectId(
            Long studentId,
            Long subjectId
    );

    List<StudentPerformance> findByStudentId(Long studentId);

    List<StudentPerformance> findByTeacherId(Long teacherId);
}