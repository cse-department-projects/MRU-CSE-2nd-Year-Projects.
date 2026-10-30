package org.cse.academiaconnect.service;

import jakarta.persistence.EntityNotFoundException;
import org.cse.academiaconnect.entity.Feedback;
import org.cse.academiaconnect.repository.FeedbackRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/**
 * Service class managing Feedback business logic.
 * Uses constructor injection and handles clean CRUD operations.
 */
@Service
@Transactional
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    public FeedbackService(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    /**
     * Submit feedback for an activity.
     */
    public Feedback createFeedback(Feedback feedback) {
        if (feedbackRepository.existsByUserIdAndActivityId(feedback.getUser().getId(), feedback.getActivity().getId())) {
            throw new IllegalArgumentException("User has already submitted feedback for this activity");
        }
        return feedbackRepository.save(feedback);
    }

    /**
     * Retrieve all Feedback entries.
     */
    @Transactional(readOnly = true)
    public List<Feedback> getAllFeedbacks() {
        return feedbackRepository.findAll();
    }

    /**
     * Retrieve Feedback by ID.
     */
    @Transactional(readOnly = true)
    public Feedback getFeedbackById(Long id) {
        return feedbackRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Feedback not found with ID: " + id));
    }

    /**
     * Update existing Feedback.
     */
    public Feedback updateFeedback(Long id, Feedback feedbackDetails) {
        Feedback existingFeedback = getFeedbackById(id);
        existingFeedback.setRating(feedbackDetails.getRating());
        existingFeedback.setComments(feedbackDetails.getComments());
        return feedbackRepository.save(existingFeedback);
    }

    /**
     * Delete Feedback by ID.
     */
    public void deleteFeedback(Long id) {
        Feedback feedback = getFeedbackById(id);
        feedbackRepository.delete(feedback);
 
 
    }

    @Transactional(readOnly = true)
public List<Feedback> getFeedbacksByActivity(Long activityId) {
    return feedbackRepository.findByActivityId(activityId);
}

@Transactional(readOnly = true)
public List<Feedback> getFeedbacksByUser(Long userId) {
    return feedbackRepository.findByUserId(userId);
}

@Transactional(readOnly = true)
public boolean hasUserSubmittedFeedback(Long userId, Long activityId) {
    return feedbackRepository.existsByUserIdAndActivityId(userId, activityId);
}

@Transactional(readOnly = true)
public Double getAverageRating(Long activityId) {
    Double average = feedbackRepository.findAverageRatingByActivityId(activityId);
    return average == null ? 0.0 : average;
}
@Transactional(readOnly = true)
public double getAverageRatingByOrganizer(Long organizerId) {

    Double average =
            feedbackRepository.findAverageRatingByOrganizerId(organizerId);

    return average == null ? 0.0 : average;
}
}