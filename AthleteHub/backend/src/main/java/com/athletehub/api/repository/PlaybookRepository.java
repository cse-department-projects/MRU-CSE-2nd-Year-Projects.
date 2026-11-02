package com.athletehub.api.repository;

import com.athletehub.api.entity.Playbook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaybookRepository extends JpaRepository<Playbook, Integer> {
    List<Playbook> findByCoachId(Integer coachId);
}
