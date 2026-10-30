package org.cse.academiaconnect.service;

import jakarta.persistence.EntityNotFoundException;
import org.cse.academiaconnect.entity.Activity;
import org.cse.academiaconnect.repository.ActivityRepository;
import org.cse.academiaconnect.repository.RegistrationRepository;
import org.cse.academiaconnect.repository.WaitlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import org.cse.academiaconnect.entity.Registration;
import org.cse.academiaconnect.entity.Waitlist;
    import java.util.Arrays;

/**
 * Service class managing Academic Activity business logic.
 * Uses constructor injection and handles clean CRUD operations.
 */
@Service
@Transactional
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final RegistrationRepository registrationRepository;
private final WaitlistRepository waitlistRepository;

    public ActivityService(
        ActivityRepository activityRepository,
        RegistrationRepository registrationRepository,
        WaitlistRepository waitlistRepository) {

    this.activityRepository = activityRepository;
    this.registrationRepository = registrationRepository;
    this.waitlistRepository = waitlistRepository;
}

    /**
     * Create a new Activity.
     */
    public Activity createActivity(Activity activity) {
        if (activity.getRegistrationDeadline().isAfter(activity.getDateTime())) {
            throw new IllegalArgumentException("Registration deadline must be before the activity scheduled time");
        }
        return activityRepository.save(activity);
    }

    /**
     * Retrieve all Activities.
     */
    @Transactional(readOnly = true)
    public List<Activity> getAllActivities() {
        return activityRepository.findAll();
    }

    /**
     * Retrieve an Activity by ID.
     */
    @Transactional(readOnly = true)
    public Activity getActivityById(Long id) {
        return activityRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Activity not found with ID: " + id));
    }

    /**
     * Update an existing Activity's details.
     */
    public Activity updateActivity(Long id, Activity activityDetails) {
        Activity existingActivity = getActivityById(id);

        if (activityDetails.getRegistrationDeadline().isAfter(activityDetails.getDateTime())) {
            throw new IllegalArgumentException("Registration deadline must be before the activity scheduled time");
        }

        existingActivity.setTitle(activityDetails.getTitle());
        existingActivity.setDescription(activityDetails.getDescription());
        existingActivity.setType(activityDetails.getType());
        existingActivity.setDateTime(activityDetails.getDateTime());
        existingActivity.setLocation(activityDetails.getLocation());
        existingActivity.setCapacity(activityDetails.getCapacity());
        existingActivity.setRegistrationDeadline(activityDetails.getRegistrationDeadline());
        existingActivity.setStatus(activityDetails.getStatus());

        return activityRepository.save(existingActivity);
    }

    /**
     * Delete an Activity by ID.
     */
    public void deleteActivity(Long id) {
        Activity activity = getActivityById(id);
        activityRepository.delete(activity);
    }
@Transactional(readOnly = true)
public List<Activity> getActivitiesByOrganizer(Long organizerId) {
    return activityRepository.findByOrganizerId(organizerId);
}
@Transactional(readOnly = true)
public long countActivitiesByOrganizer(Long organizerId) {
    return activityRepository.countByOrganizerId(organizerId);
}
public void cancelActivity(Long activityId) {

    Activity activity = getActivityById(activityId);

    activity.setStatus(Activity.ActivityStatus.CANCELLED);
    activityRepository.save(activity);

    List<Registration> registrations =
            registrationRepository.findByActivityIdAndStatusIn(
                    activityId,
                    Arrays.asList(
                            Registration.RegistrationStatus.REGISTERED,
                            Registration.RegistrationStatus.ATTENDED,
                            Registration.RegistrationStatus.ABSENT
                    )
            );

    for (Registration registration : registrations) {
        registration.setStatus(
                Registration.RegistrationStatus.CANCELLED
        );
    }

    registrationRepository.saveAll(registrations);

    List<Waitlist> waitlistEntries =
            waitlistRepository.findByActivityIdAndStatus(
                    activityId,
                    Waitlist.WaitlistStatus.WAITING
            );

    for (Waitlist waitlist : waitlistEntries) {
        waitlist.setStatus(
                Waitlist.WaitlistStatus.CANCELLED
        );
    }

    waitlistRepository.saveAll(waitlistEntries);
}
}