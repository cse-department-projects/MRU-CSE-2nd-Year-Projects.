package com.example.demo.repository;

import com.example.demo.entity.EducationalMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EducationalMaterialRepository
        extends JpaRepository<EducationalMaterial, Long> {

    List<EducationalMaterial> findByTeacherId(Long teacherId);
}