package com.athletehub.api.repository;

import com.athletehub.api.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface OrganizationRepository extends JpaRepository<Organization, Integer>, JpaSpecificationExecutor<Organization> {
    Organization findByName(String name);
    boolean existsByOrganizationCode(String organizationCode);
    Organization findByOrganizationCode(String organizationCode);

    @Query(value = "SELECT id FROM organizations ORDER BY id DESC LIMIT 1", nativeQuery = true)
    Integer findLastInsertedId();

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"organizationType"})
    org.springframework.data.domain.Page<Organization> findAll(org.springframework.data.jpa.domain.Specification<Organization> spec, org.springframework.data.domain.Pageable pageable);

    long countByStatusNot(String status);
    long countByStatus(String status);
    long countByStatusNotAndCreatedAtGreaterThanEqual(String status, java.time.LocalDateTime date);
}
