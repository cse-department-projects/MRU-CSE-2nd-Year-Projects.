package com.example.Rural.management.repository;

import com.example.Rural.management.model.ShgGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShgRepository extends JpaRepository<ShgGroup, Long> {
    Optional<ShgGroup> findByCodeIgnoreCase(String code);
}
