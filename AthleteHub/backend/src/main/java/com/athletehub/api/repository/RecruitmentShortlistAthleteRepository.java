package com.athletehub.api.repository;

import com.athletehub.api.entity.RecruitmentShortlistAthlete;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecruitmentShortlistAthleteRepository extends JpaRepository<RecruitmentShortlistAthlete, Integer> {
    List<RecruitmentShortlistAthlete> findByShortlistId(Integer shortlistId);
    Optional<RecruitmentShortlistAthlete> findByShortlistIdAndAthleteId(Integer shortlistId, Integer athleteId);
    void deleteByShortlistIdAndAthleteId(Integer shortlistId, Integer athleteId);
}
