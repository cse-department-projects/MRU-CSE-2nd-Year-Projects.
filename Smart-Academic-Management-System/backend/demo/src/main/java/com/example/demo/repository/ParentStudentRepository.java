package com.example.demo.repository;

import com.example.demo.entity.ParentStudent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ParentStudentRepository
        extends JpaRepository<ParentStudent, Long> {

    Optional<ParentStudent> findByParentId(Long parentId);

    Optional<ParentStudent> findByStudentId(Long studentId);
}