package com.example.demo.repository;

import com.example.demo.entity.StudentSubject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentSubjectRepository
        extends JpaRepository<StudentSubject, Long> {

    // Get subjects assigned to a particular student
    List<StudentSubject> findByStudentId(Long studentId);

    // Get all student-subject records for subjects
    // belonging to a particular teacher
    List<StudentSubject> findBySubjectTeacherId(Long teacherId);
}
