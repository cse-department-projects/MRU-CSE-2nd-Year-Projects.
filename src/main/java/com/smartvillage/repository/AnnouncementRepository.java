package com.smartvillage.repository;

import com.smartvillage.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByActiveTrueOrderByPostedDateDesc();
    List<Announcement> findAllByOrderByPostedDateDesc();
}
