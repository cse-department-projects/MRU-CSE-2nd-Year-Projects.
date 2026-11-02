package com.athletehub.api.service;

import com.athletehub.api.dto.EventRegistrationRequest;
import com.athletehub.api.entity.Athlete;
import com.athletehub.api.entity.Event;
import com.athletehub.api.entity.EventRegistration;
import com.athletehub.api.entity.enums.EventStatus;
import com.athletehub.api.repository.AthleteRepository;
import com.athletehub.api.repository.EventRegistrationRepository;
import com.athletehub.api.repository.EventRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class EventRegistrationService {

    private final EventRegistrationRepository eventRegistrationRepository;
    private final EventRepository eventRepository;
    private final AthleteRepository athleteRepository;

    public EventRegistrationService(EventRegistrationRepository eventRegistrationRepository,
                                    EventRepository eventRepository,
                                    AthleteRepository athleteRepository) {
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.eventRepository = eventRepository;
        this.athleteRepository = athleteRepository;
    }

    @Transactional
    public EventRegistration registerAthlete(Integer eventId, EventRegistrationRequest request, Integer currentUserId) throws Exception {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new Exception("Event not found with ID: " + eventId));

        if (event.getStatus() == EventStatus.COMPLETED || event.getStatus() == EventStatus.ARCHIVED) {
            throw new Exception("Registrations are closed. This event is already " + event.getStatus());
        }

        LocalDate today = LocalDate.now();
        if (event.getRegistrationEndDate() != null && today.isAfter(event.getRegistrationEndDate())) {
            throw new Exception("Registration window for this event has ended on " + event.getRegistrationEndDate());
        }

        Athlete athlete = athleteRepository.findById(request.getAthleteId())
                .orElseThrow(() -> new Exception("Athlete not found with ID: " + request.getAthleteId()));

        // Check organization match
        if (event.getOrganization() != null && athlete.getOrganization() != null) {
            if (!event.getOrganization().getId().equals(athlete.getOrganization().getId())) {
                throw new Exception("Athlete does not belong to the event host organization (" + event.getOrganization().getName() + ").");
            }
        }

        // Check if already registered
        if (eventRegistrationRepository.existsByEventIdAndAthleteIdAndIsDeletedFalse(eventId, athlete.getId())) {
            throw new Exception("Athlete is already registered for this event.");
        }

        EventRegistration registration = new EventRegistration();
        registration.setEvent(event);
        registration.setAthlete(athlete);
        registration.setRegistrationDate(LocalDateTime.now());
        registration.setStatus("APPROVED");
        registration.setRemarks(request.getRemarks() != null && !request.getRemarks().trim().isEmpty()
                ? request.getRemarks().trim() : "Registered for event participation");
        registration.setCreatedBy(currentUserId);
        registration.setUpdatedBy(currentUserId);

        registration = eventRegistrationRepository.save(registration);
        registration.setRegistrationCode(String.format("EVREG-%06d", registration.getId()));
        return eventRegistrationRepository.save(registration);
    }

    public Page<EventRegistration> searchRegistrations(Integer eventId, String status, String search, int page, int pageSize, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);
        return eventRegistrationRepository.searchEventRegistrations(eventId, status, search, pageable);
    }

    public Optional<EventRegistration> getMyRegistration(Integer eventId, Integer athleteId) {
        return eventRegistrationRepository.findByEventIdAndAthleteIdAndIsDeletedFalse(eventId, athleteId);
    }

    @Transactional
    public EventRegistration updateRegistrationStatus(Integer registrationId, String status, String remarks, Integer currentUserId) throws Exception {
        EventRegistration registration = eventRegistrationRepository.findByIdAndIsDeletedFalse(registrationId)
                .orElseThrow(() -> new Exception("Event registration not found"));

        registration.setStatus(status.toUpperCase());
        if (remarks != null && !remarks.trim().isEmpty()) {
            registration.setRemarks(remarks.trim());
        }
        registration.setUpdatedBy(currentUserId);
        return eventRegistrationRepository.save(registration);
    }

    @Transactional
    public void deleteRegistration(Integer registrationId, Integer currentUserId) throws Exception {
        EventRegistration registration = eventRegistrationRepository.findByIdAndIsDeletedFalse(registrationId)
                .orElseThrow(() -> new Exception("Event registration not found"));

        registration.setIsDeleted(true);
        registration.setStatus("WITHDRAWN");
        registration.setUpdatedBy(currentUserId);
        eventRegistrationRepository.save(registration);
    }
}
