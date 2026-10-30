package com.smartvillage.repository;

import com.smartvillage.model.SoilTestRequest;
import com.smartvillage.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SoilTestRequestRepository extends JpaRepository<SoilTestRequest, Long> {
    List<SoilTestRequest> findByUserOrderByCreatedAtDesc(User user);
    List<SoilTestRequest> findAllByOrderByCreatedAtDesc();
}
