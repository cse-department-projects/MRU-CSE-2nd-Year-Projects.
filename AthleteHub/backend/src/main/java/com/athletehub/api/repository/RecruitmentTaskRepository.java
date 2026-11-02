package com.athletehub.api.repository;

import com.athletehub.api.entity.RecruitmentTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RecruitmentTaskRepository extends JpaRepository<RecruitmentTask, Integer> {
    List<RecruitmentTask> findByRecruiterId(Integer recruiterId);
    List<RecruitmentTask> findByProspectId(Integer prospectId);
    List<RecruitmentTask> findByRecruiterIdAndStatusNotAndDueDateBefore(Integer recruiterId, String status, LocalDate date);
}
