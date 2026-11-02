package com.athletehub.api.repository;

import com.athletehub.api.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

import com.athletehub.api.entity.enums.EventStatus;

@Repository
public interface EventRepository extends JpaRepository<Event, Integer>, JpaSpecificationExecutor<Event> {
    List<Event> findByOrganizationIdAndEventStartDateLessThanEqualAndEventEndDateGreaterThanEqual(Integer organizationId, LocalDate endDate, LocalDate startDate);
    long countByStatus(EventStatus status);
    long countByIsDeletedFalse();
    long countByStatusAndIsDeletedFalse(EventStatus status);
    long countByOrganizationIdAndIsDeletedFalse(Integer organizationId);
    long countByOrganizationIdAndStatusAndIsDeletedFalse(Integer organizationId, EventStatus status);
}
