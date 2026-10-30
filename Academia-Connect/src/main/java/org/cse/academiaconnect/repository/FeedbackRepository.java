package org.cse.academiaconnect.repository;

import org.cse.academiaconnect.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Feedback entity operations.
 */

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    /**
     * Find all feedbacks submitted for a specific activity.
     */
    List<Feedback> findByActivityId(Long activityId);

    /**
     * Find all feedbacks submitted by a specific user.
     */
    List<Feedback> findByUserId(Long userId);

    /**
     * Find a user's feedback for a specific activity.
     */
    Optional<Feedback> findByUserIdAndActivityId(Long userId, Long activityId);

    /**
     * Check if a user has already submitted feedback for an activity.
     */
    boolean existsByUserIdAndActivityId(Long userId, Long activityId);

    /**
     * Find feedbacks for an activity rating greater than or equal to a specific value.
     */
    List<Feedback> findByActivityIdAndRatingGreaterThanEqual(Long activityId, Integer rating);

    /**
     * Calculate the average rating for a specific activity.
     */
    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.activity.id = :activityId")
    Double findAverageRatingByActivityId(@Param("activityId") Long activityId);
    @Query("""
       SELECT AVG(f.rating)
       FROM Feedback f
       WHERE f.activity.organizer.id = :organizerId
       """)
Double findAverageRatingByOrganizerId(
        @Param("organizerId") Long organizerId
);
}