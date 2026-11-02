package com.athletehub.api.repository;

import com.athletehub.api.entity.Play;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayRepository extends JpaRepository<Play, Integer> {
    List<Play> findByPlaybookId(Integer playbookId);
}
