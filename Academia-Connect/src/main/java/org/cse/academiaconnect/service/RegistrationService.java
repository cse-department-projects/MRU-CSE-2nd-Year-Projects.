package org.cse.academiaconnect.service;

import jakarta.persistence.EntityNotFoundException;
import org.cse.academiaconnect.entity.Activity;
import org.cse.academiaconnect.entity.Registration;
import org.cse.academiaconnect.repository.ActivityRepository;
import org.cse.academiaconnect.repository.RegistrationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import org.cse.academiaconnect.entity.Waitlist;
import org.cse.academiaconnect.repository.WaitlistRepository;


/**
 * Service class managing Registration business logic.
 * Uses constructor injection and handles clean CRUD operations.
 */
@Service
@Transactional
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final WaitlistRepository waitlistRepository;
    private final ActivityRepository activityRepository;

   public RegistrationService(
        RegistrationRepository registrationRepository,
        ActivityRepository activityRepository,
        WaitlistRepository waitlistRepository) {

    this.registrationRepository = registrationRepository;
    this.activityRepository = activityRepository;
    this.waitlistRepository = waitlistRepository;
}

    /**
     * Create a Registration.
     * Verifies registration deadlines, duplicates, and activity capacity.
     */
public Registration createRegistration(Registration registration) {
    return createRegistration(registration, false);
}

public Registration createRegistration(
        Registration registration,
        boolean allowScheduleConflict) {

    Activity activity = activityRepository.findById(
            registration.getActivity().getId()
    ).orElseThrow(() -> new EntityNotFoundException(
            "Activity not found with ID: "
                    + registration.getActivity().getId()
    ));

        if (LocalDateTime.now().isAfter(activity.getRegistrationDeadline())) {
            throw new IllegalStateException("Registration deadline has passed for this activity");
        }

        if (registrationRepository.existsByUserIdAndActivityId(registration.getUser().getId(), activity.getId())) {
            throw new IllegalArgumentException("User is already registered for this activity");
        }
List<Registration> userRegistrations =
        registrationRepository.findByUserId(
                registration.getUser().getId()
        );

boolean hasConflict = userRegistrations.stream()
        .filter(existing ->
                existing.getStatus() == Registration.RegistrationStatus.REGISTERED
                        || existing.getStatus() == Registration.RegistrationStatus.ATTENDED
        )
        .anyMatch(existing ->
                existing.getActivity()
                        .getDateTime()
                        .equals(activity.getDateTime())
        );
if (hasConflict && !allowScheduleConflict) {
    throw new IllegalStateException("SCHEDULE_CONFLICT");
}      long activeRegistrations = registrationRepository.countByActivityIdAndStatus(activity.getId(), Registration.RegistrationStatus.REGISTERED);
        if (activeRegistrations >= activity.getCapacity()) {
            throw new IllegalStateException("Activity capacity has been reached. Please join the waitlist instead.");
        }

        registration.setStatus(Registration.RegistrationStatus.REGISTERED);
        return registrationRepository.save(registration);
    }

    /**
     * Retrieve all Registrations.
     */
    @Transactional(readOnly = true)
    public List<Registration> getAllRegistrations() {
        return registrationRepository.findAll();
    }

    /**
     * Retrieve a Registration by ID.
     */
    @Transactional(readOnly = true)
    public Registration getRegistrationById(Long id) {
        return registrationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Registration not found with ID: " + id));
    }

    /**
     * Update an existing Registration.
     */
    public Registration updateRegistration(Long id, Registration registrationDetails) {
        Registration existingRegistration = getRegistrationById(id);
        existingRegistration.setStatus(registrationDetails.getStatus());
        return registrationRepository.save(existingRegistration);
    }

    /**
     * Delete a Registration by ID.
     */
    public void deleteRegistration(Long id) {
        Registration registration = getRegistrationById(id);
        registrationRepository.delete(registration);
    }

@Transactional(readOnly = true)
public List<Registration> getRegistrationsByUser(Long userId) {

    return registrationRepository.findByUserId(userId);

}

@Transactional(readOnly = true)
public boolean isUserRegistered(Long userId, Long activityId) {
    return registrationRepository.existsByUserIdAndActivityId(userId, activityId);
}

@Transactional(readOnly = true)
public boolean isActivityFull(Long activityId) {

    Activity activity = activityRepository.findById(activityId)
            .orElseThrow(() ->
                    new EntityNotFoundException(
                            "Activity not found with ID: " + activityId
                    ));

    long registrations =
            registrationRepository.countByActivityIdAndStatus(
                    activityId,
                    Registration.RegistrationStatus.REGISTERED
            );

    return registrations >= activity.getCapacity();
}
public void cancelRegistration(Long registrationId, Long userId) {

    Registration registration = getRegistrationById(registrationId);

    if (!registration.getUser().getId().equals(userId)) {
        throw new IllegalArgumentException(
                "You are not allowed to cancel this registration."
        );
    }

    Long activityId = registration.getActivity().getId();

    registrationRepository.delete(registration);
    registrationRepository.flush();

    Waitlist nextWaitlistedUser = waitlistRepository
            .findFirstByActivityIdAndStatusOrderByQueuePositionAsc(
                    activityId,
                    Waitlist.WaitlistStatus.WAITING
            )
            .orElse(null);

    if (nextWaitlistedUser != null) {

        Registration promotedRegistration = new Registration();
        promotedRegistration.setUser(nextWaitlistedUser.getUser());
        promotedRegistration.setActivity(nextWaitlistedUser.getActivity());
        promotedRegistration.setStatus(
                Registration.RegistrationStatus.REGISTERED
        );

        registrationRepository.save(promotedRegistration);

        nextWaitlistedUser.setStatus(
                Waitlist.WaitlistStatus.CONVERTED
        );

        waitlistRepository.save(nextWaitlistedUser);

        List<Waitlist> remainingEntries =
                waitlistRepository
                        .findByActivityIdAndStatusOrderByQueuePositionAsc(
                                activityId,
                                Waitlist.WaitlistStatus.WAITING
                        );

        for (int i = 0; i < remainingEntries.size(); i++) {
            remainingEntries.get(i).setQueuePosition(i + 1);
        }

        waitlistRepository.saveAll(remainingEntries);
    }
}
@Transactional(readOnly = true)
public List<Registration> getRegistrationsByActivity(Long activityId) {
    return registrationRepository.findByActivityId(activityId);
}

public Registration updateAttendanceStatus(
        Long registrationId,
        Registration.RegistrationStatus status) {

    Registration registration = getRegistrationById(registrationId);

    if (status != Registration.RegistrationStatus.ATTENDED
            && status != Registration.RegistrationStatus.ABSENT) {

        throw new IllegalArgumentException(
                "Attendance status must be ATTENDED or ABSENT."
        );
    }

    registration.setStatus(status);

    return registrationRepository.save(registration);
}
@Transactional(readOnly = true)
public long countRegistrationsByOrganizer(Long organizerId) {
    return registrationRepository.countByActivityOrganizerId(organizerId);
}
}