package com.smartvillage.repository;

import com.smartvillage.model.Complaint;
import com.smartvillage.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByUserOrderByCreatedAtDesc(User user);
    List<Complaint> findAllByOrderByCreatedAtDesc();
    List<Complaint> findByStatus(String status);
    List<Complaint> findByCategory(String category);
    long countByStatus(String status);
}
