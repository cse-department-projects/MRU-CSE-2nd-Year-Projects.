package com.athletehub.api.repository;

import com.athletehub.api.entity.RecruitmentShortlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecruitmentShortlistRepository extends JpaRepository<RecruitmentShortlist, Integer> {
    List<RecruitmentShortlist> findByRecruiterId(Integer recruiterId);
}
