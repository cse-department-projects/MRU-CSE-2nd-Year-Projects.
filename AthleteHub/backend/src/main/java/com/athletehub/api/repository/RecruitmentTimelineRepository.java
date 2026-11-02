package com.athletehub.api.repository;

import com.athletehub.api.entity.RecruitmentTimeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecruitmentTimelineRepository extends JpaRepository<RecruitmentTimeline, Integer> {
    List<RecruitmentTimeline> findByProspectIdOrderByCreatedAtDesc(Integer prospectId);
    List<RecruitmentTimeline> findTop10ByRecruiterIdOrderByCreatedAtDesc(Integer recruiterId);
}
