package com.athletehub.api.repository;

import com.athletehub.api.entity.OrganizationJoinRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationJoinRequestRepository extends JpaRepository<OrganizationJoinRequest, Integer> {

    List<OrganizationJoinRequest> findByUserIdOrderByCreatedAtDesc(Integer userId);

    Optional<OrganizationJoinRequest> findFirstByUserIdAndStatusOrderByCreatedAtDesc(Integer userId, String status);

    List<OrganizationJoinRequest> findByOrganizationIdAndStatusOrderByCreatedAtDesc(Integer organizationId, String status);

    List<OrganizationJoinRequest> findByOrganizationIdOrderByCreatedAtDesc(Integer organizationId);

    boolean existsByUserIdAndOrganizationIdAndStatus(Integer userId, Integer organizationId, String status);

    long countByOrganizationIdAndStatus(Integer organizationId, String status);
}
