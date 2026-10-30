package com.example.demo.repository;

import com.example.demo.model.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicineRepository
        extends JpaRepository<Medicine, Long> {

    // Get all medicines belonging to a user
    List<Medicine> findByUserId(Long userId);
}