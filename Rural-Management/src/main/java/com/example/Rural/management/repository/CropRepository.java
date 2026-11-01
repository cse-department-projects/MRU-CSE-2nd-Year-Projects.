package com.example.Rural.management.repository;

import com.example.Rural.management.model.Crop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CropRepository extends JpaRepository<Crop, Long> {
    List<Crop> findBySeasonIgnoreCase(String season);
    Crop findByCropNameIgnoreCase(String cropName);
}
