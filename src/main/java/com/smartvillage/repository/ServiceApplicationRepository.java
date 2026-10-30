package com.smartvillage.repository;

import com.smartvillage.model.ServiceApplication;
import com.smartvillage.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceApplicationRepository extends JpaRepository<ServiceApplication, Long> {
    List<ServiceApplication> findByUserOrderBySubmissionDateDesc(User user);
    List<ServiceApplication> findAllByOrderBySubmissionDateDesc();
    List<ServiceApplication> findByStatus(String status);
    long countByStatus(String status);
}
