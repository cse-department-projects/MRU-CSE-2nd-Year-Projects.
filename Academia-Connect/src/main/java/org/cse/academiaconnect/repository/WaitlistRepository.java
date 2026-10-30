package org.cse.academiaconnect.repository;

import org.cse.academiaconnect.entity.Waitlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Waitlist entity operations.
 */

public interface WaitlistRepository extends JpaRepository<Waitlist, Long> {

    /**
     * Find all waitlist entries for a specific user.
     */
    List<Waitlist> findByUserId(Long userId);

    /**
     * Find all waitlist entries for an activity ordered by queue position.
     */
    List<Waitlist> findByActivityIdOrderByQueuePositionAsc(Long activityId);

    /**
     * Find a specific user's waitlist entry for a given activity.
     */
    Optional<Waitlist> findByUserIdAndActivityId(Long userId, Long activityId);

    /**
     * Check if a user is waitlisted for a specific activity.
     */
    boolean existsByUserIdAndActivityId(Long userId, Long activityId);

    /**
     * Find waitlist entries for an activity filtered by status and ordered by queue position.
     */
    List<Waitlist> findByActivityIdAndStatusOrderByQueuePositionAsc(Long activityId, Waitlist.WaitlistStatus status);

    /**
     * Find the next person in line (queue position 1 / first waiting) on the waitlist for an activity.
     */
    Optional<Waitlist> findFirstByActivityIdAndStatusOrderByQueuePositionAsc(Long activityId, Waitlist.WaitlistStatus status);
    long countByActivityOrganizerIdAndStatus(
        Long organizerId,
        Waitlist.WaitlistStatus status
);
List<Waitlist> findByActivityIdAndStatus(
        Long activityId,
        Waitlist.WaitlistStatus status
);
}