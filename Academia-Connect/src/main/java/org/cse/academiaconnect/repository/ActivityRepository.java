package org.cse.academiaconnect.repository;

import org.cse.academiaconnect.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for Activity entity operations.
 */

public interface ActivityRepository extends JpaRepository<Activity, Long> {

    /**
     * Find all activities organized by a specific user.
     */
    List<Activity> findByOrganizerId(Long organizerId);

    /**
     * Find all activities filtered by their current status.
     */
    List<Activity> findByStatus(Activity.ActivityStatus status);

    /**
     * Find all activities of a specific type (e.g., WORKSHOP, SEMINAR).
     */
    List<Activity> findByType(Activity.ActivityType type);

    /**
     * Find all upcoming activities scheduled after a certain date and time.
     */
    List<Activity> findByDateTimeAfter(LocalDateTime dateTime);

    /**
     * Find activities whose registration deadline has passed and match a specific status.
     */
    List<Activity> findByRegistrationDeadlineBeforeAndStatus(LocalDateTime deadline, Activity.ActivityStatus status);

    /**
     * Search activities by location (case-insensitive partial match).
     */
    List<Activity> findByLocationContainingIgnoreCase(String location);

    long countByOrganizerId(Long organizerId);
}