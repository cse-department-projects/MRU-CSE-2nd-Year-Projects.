package com.athletehub.api.repository;

import com.athletehub.api.entity.Coach;
import com.athletehub.api.entity.enums.CoachStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface CoachRepository extends JpaRepository<Coach, Integer>, JpaSpecificationExecutor<Coach> {
    
    Coach findByUserId(Integer userId);
    
    Coach findByEmail(String email);
    
    long countByStatus(CoachStatus status);

    java.util.List<Coach> findByOrganizationId(Integer organizationId);

    java.util.List<Coach> findByOrganizationIdAndStatusNot(Integer organizationId, CoachStatus status);
    
    @Query("SELECT c.organizationId as orgId, COUNT(c) as count FROM Coach c WHERE c.status = :status GROUP BY c.organizationId")
    List<Object[]> countCoachesByOrganizationAndStatus(@Param("status") CoachStatus status);
    
    @Query("SELECT c.specialization as spec, COUNT(c) as count FROM Coach c WHERE c.status = :status GROUP BY c.specialization")
    List<Object[]> countCoachesBySpecializationAndStatus(@Param("status") CoachStatus status);

    @Query("SELECT AVG(c.experienceYears) FROM Coach c WHERE c.status = :status")
    Double getAverageExperienceByStatus(@Param("status") CoachStatus status);

    @Query(value = "SELECT id FROM coaches ORDER BY id DESC LIMIT 1", nativeQuery = true)
    Integer findLastInsertedId();
}
