package com.example.Rural.management.repository;

import com.example.Rural.management.model.Farmer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FarmerRepository extends JpaRepository<Farmer, Long> {
    List<Farmer> findByWardIgnoreCase(String ward);
    List<Farmer> findByMainCropIgnoreCase(String mainCrop);
}
