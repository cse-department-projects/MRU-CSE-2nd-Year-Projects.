package com.educonnect.backend.repository;

import com.educonnect.backend.entity.Result;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResultRepository extends JpaRepository<Result, Long> {

    List<Result> findByStudentId(Long studentId);

    Optional<Result> findByStudentIdAndSubject(Long studentId, String subject);
}