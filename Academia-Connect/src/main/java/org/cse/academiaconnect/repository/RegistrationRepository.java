package org.cse.academiaconnect.repository;

import org.cse.academiaconnect.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Registration entity operations.
 */

public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    /**
     * Find all registrations for a specific user.
     */
    List<Registration> findByUserId(Long userId);

    /**
     * Find all registrations for a specific activity.
     */
    List<Registration> findByActivityId(Long activityId);

    /**
     * Find a specific registration by user and activity.
     */
    Optional<Registration> findByUserIdAndActivityId(Long userId, Long activityId);

    /**
     * Check if a registration exists for a given user and activity.
     */
    boolean existsByUserIdAndActivityId(Long userId, Long activityId);

    /**
     * Find all registrations for an activity with a specific status (e.g. ATTENDED, REGISTERED).
     */
    List<Registration> findByActivityIdAndStatus(Long activityId, Registration.RegistrationStatus status);

    /**
     * Count the number of active/attended registrations for a specific activity.
     */
    long countByActivityIdAndStatus(Long activityId, Registration.RegistrationStatus status);

    long countByActivityOrganizerId(Long organizerId);

    List<Registration> findByActivityIdAndStatusIn(
        Long activityId,
        List<Registration.RegistrationStatus> statuses
);
}