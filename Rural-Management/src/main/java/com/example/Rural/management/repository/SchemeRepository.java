package com.example.Rural.management.repository;

import com.example.Rural.management.model.Scheme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SchemeRepository extends JpaRepository<Scheme, Long> {
    List<Scheme> findByCategoryIgnoreCase(String category);
}
