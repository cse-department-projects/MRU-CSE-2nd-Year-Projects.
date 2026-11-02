package com.athletehub.api.repository;

import com.athletehub.api.entity.Sport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SportRepository extends JpaRepository<Sport, Integer> {
    List<Sport> findByStatus(String status);
    java.util.Optional<Sport> findByNameIgnoreCase(String name);
}
