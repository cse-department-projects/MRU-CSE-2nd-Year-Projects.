package com.athletehub.api.repository;

import com.athletehub.api.entity.OrganizationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrganizationTypeRepository extends JpaRepository<OrganizationType, Integer> {
    List<OrganizationType> findByStatus(String status);
}
