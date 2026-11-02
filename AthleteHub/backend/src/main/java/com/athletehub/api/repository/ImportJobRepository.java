package com.athletehub.api.repository;

import com.athletehub.api.entity.ImportJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImportJobRepository extends JpaRepository<ImportJob, Integer> {
    List<ImportJob> findAllByOrderByStartedAtDesc();
}
