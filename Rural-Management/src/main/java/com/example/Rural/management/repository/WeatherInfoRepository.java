package com.example.Rural.management.repository;

import com.example.Rural.management.model.WeatherInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WeatherInfoRepository extends JpaRepository<WeatherInfo, Long> {
    Optional<WeatherInfo> findFirstByOrderByIdDesc();
}
