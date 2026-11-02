package com.athletehub.api.service;

import com.athletehub.api.dto.EventRequest;
import com.athletehub.api.entity.Event;
import com.athletehub.api.entity.Organization;
import com.athletehub.api.entity.enums.EventStatus;
import com.athletehub.api.repository.EventRepository;
import com.athletehub.api.repository.OrganizationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final OrganizationRepository organizationRepository;

    public EventService(EventRepository eventRepository, OrganizationRepository organizationRepository) {
        this.eventRepository = eventRepository;
        this.organizationRepository = organizationRepository;
    }

    @Transactional
    public Event createEvent(EventRequest request, Integer userId) throws Exception {
        validateEventDates(request.getRegistrationStartDate(), request.getRegistrationEndDate(),
                request.getEventStartDate(), request.getEventEndDate());
        
        Organization org = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new Exception("Organization not found"));

        validateNoOverlappingEvents(org.getId(), request.getEventStartDate(), request.getEventEndDate(), null);

        Event event = new Event();
        event.setName(request.getName());
        event.setDescription(request.getDescription());
        event.setEventType(request.getEventType());
        event.setOrganization(org);
        event.setVenue(request.getVenue());
        event.setCity(request.getCity());
        event.setState(request.getState());
        event.setCountry(request.getCountry());
        event.setRegistrationStartDate(request.getRegistrationStartDate());
        event.setRegistrationEndDate(request.getRegistrationEndDate());
        event.setEventStartDate(request.getEventStartDate());
        event.setEventEndDate(request.getEventEndDate());
        event.setBannerImage(request.getBannerImage());
        if (request.getStatus() != null) {
            event.setStatus(EventStatus.valueOf(request.getStatus()));
        } else {
            event.setStatus(EventStatus.UPCOMING);
        }
        event.setCreatedBy(userId);
        event.setUpdatedBy(userId);

        // Workflow: Save -> Get ID -> Generate Code -> Save Again
        event = eventRepository.save(event);
        event.setEventCode(String.format("EVT%06d", event.getId()));
        return eventRepository.save(event);
    }

    @Transactional
    public Event updateEvent(Integer id, EventRequest request, Integer userId) throws Exception {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new Exception("Event not found"));

        if (event.getStatus() == EventStatus.ARCHIVED || event.getStatus() == EventStatus.COMPLETED) {
            throw new Exception("Cannot edit an Archived or Completed Event.");
        }

        validateEventDates(request.getRegistrationStartDate(), request.getRegistrationEndDate(),
                request.getEventStartDate(), request.getEventEndDate());

        Organization org = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new Exception("Organization not found"));

        validateNoOverlappingEvents(org.getId(), request.getEventStartDate(), request.getEventEndDate(), id);

        event.setName(request.getName());
        event.setDescription(request.getDescription());
        event.setEventType(request.getEventType());
        event.setOrganization(org);
        event.setVenue(request.getVenue());
        event.setCity(request.getCity());
        event.setState(request.getState());
        event.setCountry(request.getCountry());
        event.setRegistrationStartDate(request.getRegistrationStartDate());
        event.setRegistrationEndDate(request.getRegistrationEndDate());
        event.setEventStartDate(request.getEventStartDate());
        event.setEventEndDate(request.getEventEndDate());
        if (request.getBannerImage() != null) {
            event.setBannerImage(request.getBannerImage());
        }
        if (request.getStatus() != null) {
            event.setStatus(EventStatus.valueOf(request.getStatus()));
        }
        event.setUpdatedBy(userId);

        return eventRepository.save(event);
    }

    public Event getEventById(Integer id) throws Exception {
        return eventRepository.findById(id).orElseThrow(() -> new Exception("Event not found"));
    }

    @Transactional
    public Event startEvent(Integer id, Integer userId) throws Exception {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new Exception("Event not found"));

        if (Boolean.TRUE.equals(event.getIsDeleted())) {
            throw new Exception("Deleted events cannot be started.");
        }
        if (event.getStatus() != EventStatus.UPCOMING) {
            throw new Exception("Only an upcoming event can be started.");
        }

        event.setStatus(EventStatus.ACTIVE);
        event.setUpdatedBy(userId);
        return eventRepository.save(event);
    }

    @Transactional
    public Event endEvent(Integer id, Integer userId) throws Exception {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new Exception("Event not found"));

        if (Boolean.TRUE.equals(event.getIsDeleted())) {
            throw new Exception("Deleted events cannot be ended.");
        }
        if (event.getStatus() != EventStatus.ACTIVE && event.getStatus() != EventStatus.UPCOMING) {
            throw new Exception("Only an active or upcoming event can be ended.");
        }

        event.setStatus(EventStatus.COMPLETED);
        event.setUpdatedBy(userId);
        return eventRepository.save(event);
    }

    @Transactional
    public Event startRegistration(Integer id, Integer userId) throws Exception {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new Exception("Event not found"));

        if (Boolean.TRUE.equals(event.getIsDeleted())) {
            throw new Exception("Deleted events cannot have registration updated.");
        }
        if (event.getStatus() == EventStatus.COMPLETED || event.getStatus() == EventStatus.CANCELLED || event.getStatus() == EventStatus.ARCHIVED) {
            throw new Exception("Cannot open registration for a completed or cancelled event.");
        }

        LocalDate today = LocalDate.now();
        event.setRegistrationStartDate(today);
        if (event.getRegistrationEndDate() == null || event.getRegistrationEndDate().isBefore(today)) {
            LocalDate evtStart = event.getEventStartDate() != null ? event.getEventStartDate() : today.plusDays(7);
            event.setRegistrationEndDate(evtStart.isAfter(today) ? evtStart.minusDays(1) : today.plusDays(7));
        }
        event.setUpdatedBy(userId);
        return eventRepository.save(event);
    }

    @Transactional
    public Event endRegistration(Integer id, Integer userId) throws Exception {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new Exception("Event not found"));

        if (Boolean.TRUE.equals(event.getIsDeleted())) {
            throw new Exception("Deleted events cannot have registration updated.");
        }

        LocalDate today = LocalDate.now();
        LocalDate closedDate = today.minusDays(1);
        event.setRegistrationEndDate(closedDate);
        if (event.getRegistrationStartDate() != null && event.getRegistrationStartDate().isAfter(closedDate)) {
            event.setRegistrationStartDate(closedDate);
        }
        event.setUpdatedBy(userId);
        return eventRepository.save(event);
    }

    private void validateEventDates(LocalDate regStart, LocalDate regEnd, LocalDate evtStart, LocalDate evtEnd) throws Exception {
        if (evtEnd.isBefore(evtStart)) {
            throw new Exception("Event End Date cannot precede Event Start Date.");
        }
        if (regEnd.isAfter(evtStart) || regEnd.isEqual(evtStart)) {
            throw new Exception("Registration End Date must be before Event Start Date.");
        }
        if (regEnd.isBefore(regStart)) {
            throw new Exception("Registration End Date cannot precede Registration Start Date.");
        }
    }

    private void validateNoOverlappingEvents(Integer orgId, LocalDate start, LocalDate end, Integer excludeEventId) throws Exception {
        List<Event> overlaps = eventRepository.findByOrganizationIdAndEventStartDateLessThanEqualAndEventEndDateGreaterThanEqual(orgId, end, start);
        for (Event e : overlaps) {
            if (excludeEventId == null || !e.getId().equals(excludeEventId)) {
                if (e.getStatus() != EventStatus.CANCELLED && e.getStatus() != EventStatus.ARCHIVED) {
                    throw new Exception("Duplicate Events with overlapping dates are not allowed for the same Organization.");
                }
            }
        }
    }

    public Page<Event> searchEvents(String search, Integer organizationId, String status, int page, int pageSize, String sortBy, String sortDir) {
        Specification<Event> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDeleted")));

            if (status != null && !status.isEmpty()) {
                predicates.add(cb.equal(root.get("status"), EventStatus.valueOf(status)));
            }
            if (organizationId != null) {
                predicates.add(cb.equal(root.get("organization").get("id"), organizationId));
            }
            if (search != null && !search.isEmpty()) {
                String likeSearch = "%" + search + "%";
                predicates.add(cb.or(
                        cb.like(root.get("eventCode"), likeSearch),
                        cb.like(root.get("name"), likeSearch),
                        cb.like(root.get("venue"), likeSearch)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);
        return eventRepository.findAll(spec, pageable);
    }

    @Transactional
    public void deleteEvent(Integer id, Integer userId) throws Exception {
        Event event = eventRepository.findById(id).orElseThrow(() -> new Exception("Event not found"));
        event.setIsDeleted(true);
        event.setUpdatedBy(userId);
        eventRepository.save(event);
    }
}
