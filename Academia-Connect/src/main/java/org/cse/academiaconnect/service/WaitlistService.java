package org.cse.academiaconnect.service;

import jakarta.persistence.EntityNotFoundException;
import org.cse.academiaconnect.entity.Waitlist;
import org.cse.academiaconnect.repository.WaitlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/**
 * Service class managing Waitlist business logic.
 * Uses constructor injection and handles clean CRUD operations.
 */
@Service
@Transactional
public class WaitlistService {

    private final WaitlistRepository waitlistRepository;

    public WaitlistService(WaitlistRepository waitlistRepository) {
        this.waitlistRepository = waitlistRepository;
    }

    /**
     * Add a user to the Waitlist.
     * Computes the queue position automatically based on active waitlist queue length.
     */
    public Waitlist createWaitlist(Waitlist waitlist) {
        if (waitlistRepository.existsByUserIdAndActivityId(waitlist.getUser().getId(), waitlist.getActivity().getId())) {
            throw new IllegalArgumentException("User is already waitlisted for this activity");
        }

        List<Waitlist> activeQueue = waitlistRepository.findByActivityIdAndStatusOrderByQueuePositionAsc(
                waitlist.getActivity().getId(), Waitlist.WaitlistStatus.WAITING);
        
        waitlist.setQueuePosition(activeQueue.size() + 1);
        waitlist.setStatus(Waitlist.WaitlistStatus.WAITING);

        return waitlistRepository.save(waitlist);
    }

    /**
     * Retrieve all Waitlist entries.
     */
    @Transactional(readOnly = true)
    public List<Waitlist> getAllWaitlistEntries() {
        return waitlistRepository.findAll();
    }

    /**
     * Retrieve a Waitlist entry by ID.
     */
    @Transactional(readOnly = true)
    public Waitlist getWaitlistById(Long id) {
        return waitlistRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Waitlist entry not found with ID: " + id));
    }

    /**
     * Update an existing Waitlist entry's details.
     */
    public Waitlist updateWaitlist(Long id, Waitlist waitlistDetails) {
        Waitlist existingWaitlist = getWaitlistById(id);
        existingWaitlist.setQueuePosition(waitlistDetails.getQueuePosition());
        existingWaitlist.setStatus(waitlistDetails.getStatus());
        return waitlistRepository.save(existingWaitlist);
    }

    /**
     * Remove a user from the Waitlist.
     */
    public void deleteWaitlist(Long id) {
        Waitlist waitlist = getWaitlistById(id);
        waitlistRepository.delete(waitlist);
    }

@Transactional(readOnly = true)
public List<Waitlist> getWaitlistEntriesByUser(Long userId) {
    return waitlistRepository.findByUserId(userId);
}
@Transactional(readOnly = true)
public boolean isUserWaitlisted(Long userId, Long activityId) {
    return waitlistRepository.existsByUserIdAndActivityId(userId, activityId);
}

public void cancelWaitlist(Long waitlistId, Long userId) {

    Waitlist waitlist = getWaitlistById(waitlistId);

    if (!waitlist.getUser().getId().equals(userId)) {
        throw new IllegalArgumentException(
                "You are not allowed to cancel this waitlist entry."
        );
    }

    Long activityId = waitlist.getActivity().getId();

    waitlistRepository.delete(waitlist);
    waitlistRepository.flush();

    List<Waitlist> waitingEntries =
            waitlistRepository
                    .findByActivityIdAndStatusOrderByQueuePositionAsc(
                            activityId,
                            Waitlist.WaitlistStatus.WAITING
                    );

    for (int i = 0; i < waitingEntries.size(); i++) {
        waitingEntries.get(i).setQueuePosition(i + 1);
    }

    waitlistRepository.saveAll(waitingEntries);
}
@Transactional(readOnly = true)
public List<Waitlist> getWaitlistEntriesByActivity(Long activityId) {
    return waitlistRepository.findByActivityIdOrderByQueuePositionAsc(activityId);
}
@Transactional(readOnly = true)
public long countWaitingUsersByOrganizer(Long organizerId) {
    return waitlistRepository.countByActivityOrganizerIdAndStatus(
            organizerId,
            Waitlist.WaitlistStatus.WAITING
    );
}
}