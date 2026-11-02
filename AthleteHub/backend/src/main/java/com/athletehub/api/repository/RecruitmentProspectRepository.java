package com.athletehub.api.repository;

import com.athletehub.api.entity.RecruitmentProspect;
import com.athletehub.api.entity.enums.RecruitmentStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecruitmentProspectRepository extends JpaRepository<RecruitmentProspect, Integer>, JpaSpecificationExecutor<RecruitmentProspect> {
    
    Optional<RecruitmentProspect> findByAthleteIdAndRecruiterId(Integer athleteId, Integer recruiterId);
    
    List<RecruitmentProspect> findByRecruiterId(Integer recruiterId);
    
    List<RecruitmentProspect> findByOrganizationId(Integer organizationId);

    List<RecruitmentProspect> findByAthleteId(Integer athleteId);
    
    long countByRecruiterId(Integer recruiterId);
    
    long countByRecruiterIdAndStage(Integer recruiterId, RecruitmentStage stage);
    
    long countByOrganizationIdAndStage(Integer organizationId, RecruitmentStage stage);
}
