package com.athletehub.api.repository;

import com.athletehub.api.entity.EventRegistration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Integer> {

    Optional<EventRegistration> findByIdAndIsDeletedFalse(Integer id);

    Optional<EventRegistration> findByEventIdAndAthleteIdAndIsDeletedFalse(Integer eventId, Integer athleteId);

    boolean existsByEventIdAndAthleteIdAndIsDeletedFalse(Integer eventId, Integer athleteId);

    List<EventRegistration> findByEventIdAndIsDeletedFalse(Integer eventId);

    long countByEventIdAndIsDeletedFalse(Integer eventId);

    @Query("SELECT er FROM EventRegistration er " +
           "JOIN er.athlete a " +
           "WHERE er.event.id = :eventId " +
           "AND er.isDeleted = false " +
           "AND (:status IS NULL OR er.status = :status) " +
           "AND (:search IS NULL OR LOWER(a.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(a.lastName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(er.registrationCode) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<EventRegistration> searchEventRegistrations(
            @Param("eventId") Integer eventId,
            @Param("status") String status,
            @Param("search") String search,
            Pageable pageable
    );
}
