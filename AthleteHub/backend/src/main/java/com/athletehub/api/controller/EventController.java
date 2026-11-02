package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.dto.EventMapper;
import com.athletehub.api.dto.EventRequest;
import com.athletehub.api.dto.EventResponse;
import com.athletehub.api.entity.Event;
import com.athletehub.api.entity.User;
import com.athletehub.api.repository.UserRepository;
import com.athletehub.api.service.EventService;
import com.athletehub.api.dto.EventRegistrationMapper;
import com.athletehub.api.dto.EventRegistrationRequest;
import com.athletehub.api.dto.EventRegistrationResponse;
import com.athletehub.api.entity.Athlete;
import com.athletehub.api.entity.EventRegistration;
import com.athletehub.api.repository.AthleteRepository;
import com.athletehub.api.service.EventRegistrationService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/events")
public class EventController {

    private final EventService eventService;
    private final UserRepository userRepository;
    private final EventRegistrationService eventRegistrationService;
    private final AthleteRepository athleteRepository;

    public EventController(EventService eventService, 
                           UserRepository userRepository,
                           EventRegistrationService eventRegistrationService,
                           AthleteRepository athleteRepository) {
        this.eventService = eventService;
        this.userRepository = userRepository;
        this.eventRegistrationService = eventRegistrationService;
        this.athleteRepository = athleteRepository;
    }

    private Integer getCurrentUserId() {
        if (SecurityContextHolder.getContext().getAuthentication() == null) return null;
        String principal = SecurityContextHolder.getContext().getAuthentication().getName();
        if (principal == null) return null;
        User user = userRepository.findByEmailOrUsername(principal).orElse(null);
        return user != null ? user.getId() : null;
    }

    @PostMapping
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<EventResponse>> createEvent(@RequestBody EventRequest request) {
        try {
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN")) {
                if (currentUser.getOrganization() == null) {
                    throw new Exception("Organization Administrator is not linked to any organization.");
                }
                request.setOrganizationId(currentUser.getOrganization().getId());
            }

            Event event = eventService.createEvent(request, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Event created successfully", EventMapper.toResponse(event)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<EventResponse>> updateEvent(@PathVariable Integer id, @RequestBody EventRequest request) {
        try {
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN")) {
                if (currentUser.getOrganization() == null) {
                    throw new Exception("Organization Administrator is not linked to any organization.");
                }
                request.setOrganizationId(currentUser.getOrganization().getId());
            }

            Event event = eventService.updateEvent(id, request, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Event updated successfully", EventMapper.toResponse(event)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @PostMapping("/{id}/start")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<EventResponse>> startEvent(@PathVariable Integer id) {
        try {
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            Event event = eventService.getEventById(id);

            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN")
                    && (currentUser.getOrganization() == null
                    || !event.getOrganization().getId().equals(currentUser.getOrganization().getId()))) {
                throw new Exception("Access Denied: Event belongs to a different organization.");
            }

            Event startedEvent = eventService.startEvent(id, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Event started successfully", EventMapper.toResponse(startedEvent)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @PostMapping("/{id}/end")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<EventResponse>> endEvent(@PathVariable Integer id) {
        try {
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            Event event = eventService.getEventById(id);

            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN")
                    && (currentUser.getOrganization() == null
                    || !event.getOrganization().getId().equals(currentUser.getOrganization().getId()))) {
                throw new Exception("Access Denied: Event belongs to a different organization.");
            }

            Event endedEvent = eventService.endEvent(id, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Event completed successfully", EventMapper.toResponse(endedEvent)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @PostMapping("/{id}/start-registration")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<EventResponse>> startRegistration(@PathVariable Integer id) {
        try {
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            Event event = eventService.getEventById(id);

            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN")
                    && (currentUser.getOrganization() == null
                    || !event.getOrganization().getId().equals(currentUser.getOrganization().getId()))) {
                throw new Exception("Access Denied: Event belongs to a different organization.");
            }

            Event updatedEvent = eventService.startRegistration(id, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Registrations opened successfully", EventMapper.toResponse(updatedEvent)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @PostMapping("/{id}/end-registration")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<EventResponse>> endRegistration(@PathVariable Integer id) {
        try {
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            Event event = eventService.getEventById(id);

            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN")
                    && (currentUser.getOrganization() == null
                    || !event.getOrganization().getId().equals(currentUser.getOrganization().getId()))) {
                throw new Exception("Access Denied: Event belongs to a different organization.");
            }

            Event updatedEvent = eventService.endRegistration(id, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Registrations closed successfully", EventMapper.toResponse(updatedEvent)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ATHLETE', 'COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<EventResponse>> getEvent(@PathVariable Integer id) {
        try {
            Event event = eventService.getEventById(id);
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN") || currentUser.getRole().getName().equals("ROLE_COACH")) {
                if (currentUser.getOrganization() != null && !event.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
                    throw new Exception("Access Denied: Event belongs to a different organization.");
                }
            }
            return ResponseEntity.ok(ApiResponse.success("Event details fetched successfully", EventMapper.toResponse(event)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ATHLETE', 'COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEvents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer organizationId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        try {
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN") || currentUser.getRole().getName().equals("ROLE_COACH") || currentUser.getRole().getName().equals("ROLE_ATHLETE")) {
                if (currentUser.getOrganization() != null) {
                    organizationId = currentUser.getOrganization().getId();
                } else {
                    organizationId = -1; // Force empty result if not linked
                }
            }

            Page<Event> eventPage = eventService.searchEvents(search, organizationId, status, page, pageSize, sortBy, sortDir);
            
            Map<String, Object> result = new HashMap<>();
            result.put("items", eventPage.getContent().stream().map(EventMapper::toResponse).collect(Collectors.toList()));
            result.put("total_records", eventPage.getTotalElements());
            result.put("total_pages", eventPage.getTotalPages());
            result.put("page", page);
            result.put("page_size", pageSize);
            
            return ResponseEntity.ok(ApiResponse.success("Events fetched successfully", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORG_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable Integer id) {
        try {
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            Event event = eventService.getEventById(id);
            
            if (currentUser.getRole().getName().equals("ROLE_ORG_ADMIN")) {
                if (currentUser.getOrganization() != null && !event.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
                    throw new Exception("Access Denied: Event belongs to a different organization.");
                }
            }

            eventService.deleteEvent(id, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Event deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @PostMapping("/{id}/registrations")
    @PreAuthorize("hasAnyRole('ATHLETE', 'COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<EventRegistrationResponse>> registerForEvent(
            @PathVariable Integer id,
            @RequestBody EventRegistrationRequest request) {
        try {
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            if ("ROLE_ATHLETE".equals(currentUser.getRole().getName())) {
                Athlete athlete = athleteRepository.findByUserId(currentUser.getId());
                if (athlete == null) {
                    throw new Exception("Athlete profile not found for this account.");
                }
                request.setAthleteId(athlete.getId());
            } else if (request.getAthleteId() == null) {
                throw new Exception("Athlete ID is required.");
            }

            EventRegistration reg = eventRegistrationService.registerAthlete(id, request, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Registered for event successfully", EventRegistrationMapper.toResponse(reg)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @GetMapping("/{id}/registrations")
    @PreAuthorize("hasAnyRole('ATHLETE', 'COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEventRegistrations(
            @PathVariable Integer id,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            Page<EventRegistration> regPage = eventRegistrationService.searchRegistrations(id, status, search, page, pageSize, sortBy, sortDir);
            Map<String, Object> result = new HashMap<>();
            result.put("items", regPage.getContent().stream().map(EventRegistrationMapper::toResponse).collect(Collectors.toList()));
            result.put("total_records", regPage.getTotalElements());
            result.put("total_pages", regPage.getTotalPages());
            result.put("page", page);
            result.put("page_size", pageSize);
            return ResponseEntity.ok(ApiResponse.success("Event registrations fetched successfully", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @GetMapping("/{id}/my-registration")
    @PreAuthorize("hasRole('ATHLETE')")
    public ResponseEntity<ApiResponse<EventRegistrationResponse>> getMyEventRegistration(@PathVariable Integer id) {
        try {
            User currentUser = userRepository.findById(getCurrentUserId()).orElseThrow();
            Athlete athlete = athleteRepository.findByUserId(currentUser.getId());
            if (athlete == null) {
                return ResponseEntity.ok(ApiResponse.success("No athlete profile", null));
            }

            EventRegistration reg = eventRegistrationService.getMyRegistration(id, athlete.getId()).orElse(null);
            return ResponseEntity.ok(ApiResponse.success("My registration fetched", EventRegistrationMapper.toResponse(reg)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @PutMapping("/registrations/{registrationId}/status")
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'SUPER_ADMIN', 'COACH')")
    public ResponseEntity<ApiResponse<EventRegistrationResponse>> updateEventRegistrationStatus(
            @PathVariable Integer registrationId,
            @RequestParam String status,
            @RequestParam(required = false) String remarks) {
        try {
            EventRegistration reg = eventRegistrationService.updateRegistrationStatus(registrationId, status, remarks, getCurrentUserId());
            return ResponseEntity.ok(ApiResponse.success("Registration status updated successfully", EventRegistrationMapper.toResponse(reg)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }

    @DeleteMapping("/registrations/{registrationId}")
    @PreAuthorize("hasAnyRole('ATHLETE', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> withdrawEventRegistration(@PathVariable Integer registrationId) {
        try {
            eventRegistrationService.deleteRegistration(registrationId, getCurrentUserId());
            return ResponseEntity.ok(ApiResponse.success("Event registration withdrawn successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>("error", e.getMessage(), null, null));
        }
    }
}
