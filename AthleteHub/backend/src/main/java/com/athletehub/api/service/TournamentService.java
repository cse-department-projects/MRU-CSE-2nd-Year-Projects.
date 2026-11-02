package com.athletehub.api.service;

import com.athletehub.api.dto.TournamentRequest;
import com.athletehub.api.entity.Event;
import com.athletehub.api.entity.Sport;
import com.athletehub.api.entity.Tournament;
import com.athletehub.api.entity.enums.TournamentStatus;
import com.athletehub.api.repository.EventRepository;
import com.athletehub.api.repository.SportRepository;
import com.athletehub.api.repository.TournamentRepository;
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
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final EventRepository eventRepository;
    private final SportRepository sportRepository;
    private final com.athletehub.api.security.TenantSecurityService tenantSecurityService;

    public TournamentService(TournamentRepository tournamentRepository, EventRepository eventRepository, SportRepository sportRepository, com.athletehub.api.security.TenantSecurityService tenantSecurityService) {
        this.tournamentRepository = tournamentRepository;
        this.eventRepository = eventRepository;
        this.sportRepository = sportRepository;
        this.tenantSecurityService = tenantSecurityService;
    }

    @Transactional
    public Tournament createTournament(TournamentRequest request, Integer userId) throws Exception {
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new Exception("Event not found"));

        if (event.getOrganization() != null) {
            tenantSecurityService.validateSameOrganization(event.getOrganization().getId(), "Event");
        }

        Sport sport = sportRepository.findById(request.getSportId())
                .orElseThrow(() -> new Exception("Sport not found"));

        validateTournamentDates(event, request.getStartDate(), request.getEndDate());
        validateMaxParticipants(request.getMaxParticipants());

        if (tournamentRepository.existsByEventIdAndNameIgnoreCase(event.getId(), request.getName())) {
            throw new Exception("Duplicate Tournament names within the same Event are not allowed.");
        }

        Tournament tournament = new Tournament();
        tournament.setName(request.getName());
        tournament.setEvent(event);
        tournament.setSport(sport);
        tournament.setGenderCategory(request.getGenderCategory());
        tournament.setAgeCategory(request.getAgeCategory());
        tournament.setMaxParticipants(request.getMaxParticipants());
        tournament.setRegistrationLimit(request.getRegistrationLimit());
        tournament.setStartDate(request.getStartDate());
        tournament.setEndDate(request.getEndDate());
        if (request.getStatus() != null) {
            tournament.setStatus(TournamentStatus.valueOf(request.getStatus()));
        } else {
            tournament.setStatus(TournamentStatus.UPCOMING);
        }
        tournament.setCreatedBy(userId);
        tournament.setUpdatedBy(userId);

        tournament = tournamentRepository.save(tournament);
        tournament.setTournamentCode(String.format("TRN%06d", tournament.getId()));
        return tournamentRepository.save(tournament);
    }

    @Transactional
    public Tournament updateTournament(Integer id, TournamentRequest request, Integer userId) throws Exception {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new Exception("Tournament not found"));

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new Exception("Event not found"));

        Sport sport = sportRepository.findById(request.getSportId())
                .orElseThrow(() -> new Exception("Sport not found"));

        validateTournamentDates(event, request.getStartDate(), request.getEndDate());
        validateMaxParticipants(request.getMaxParticipants());

        if (!tournament.getName().equalsIgnoreCase(request.getName()) &&
            tournamentRepository.existsByEventIdAndNameIgnoreCase(event.getId(), request.getName())) {
            throw new Exception("Duplicate Tournament names within the same Event are not allowed.");
        }

        tournament.setName(request.getName());
        tournament.setEvent(event);
        tournament.setSport(sport);
        tournament.setGenderCategory(request.getGenderCategory());
        tournament.setAgeCategory(request.getAgeCategory());
        tournament.setMaxParticipants(request.getMaxParticipants());
        tournament.setRegistrationLimit(request.getRegistrationLimit());
        tournament.setStartDate(request.getStartDate());
        tournament.setEndDate(request.getEndDate());
        if (request.getStatus() != null) {
            tournament.setStatus(TournamentStatus.valueOf(request.getStatus()));
        }
        tournament.setUpdatedBy(userId);

        return tournamentRepository.save(tournament);
    }

    public Tournament getTournamentById(Integer id) throws Exception {
        return tournamentRepository.findById(id).orElseThrow(() -> new Exception("Tournament not found"));
    }

    private void validateTournamentDates(Event event, LocalDate start, LocalDate end) throws Exception {
        if (start.isBefore(event.getEventStartDate()) || end.isAfter(event.getEventEndDate())) {
            throw new Exception("Tournament dates must remain within Event dates.");
        }
        if (end.isBefore(start)) {
            throw new Exception("Tournament End Date cannot precede Start Date.");
        }
    }

    private void validateMaxParticipants(Integer max) throws Exception {
        if (max != null && max <= 0) {
            throw new Exception("Maximum Participants must be greater than zero.");
        }
    }

    public Page<Tournament> searchTournaments(String search, Integer eventId, Integer sportId, String status, Integer organizationId, int page, int pageSize, String sortBy, String sortDir) {
        Specification<Tournament> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDeleted")));

            if (status != null && !status.isEmpty()) {
                predicates.add(cb.equal(root.get("status"), TournamentStatus.valueOf(status)));
            }
            if (eventId != null) {
                predicates.add(cb.equal(root.get("event").get("id"), eventId));
            }
            if (sportId != null) {
                predicates.add(cb.equal(root.get("sport").get("id"), sportId));
            }
            if (organizationId != null) {
                predicates.add(cb.equal(root.get("event").get("organization").get("id"), organizationId));
            }
            if (search != null && !search.isEmpty()) {
                String likeSearch = "%" + search + "%";
                predicates.add(cb.or(
                        cb.like(root.get("tournamentCode"), likeSearch),
                        cb.like(root.get("name"), likeSearch)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);
        return tournamentRepository.findAll(spec, pageable);
    }

    @Transactional
    public void deleteTournament(Integer id, Integer userId) throws Exception {
        Tournament tournament = tournamentRepository.findById(id).orElseThrow(() -> new Exception("Tournament not found"));
        tournament.setIsDeleted(true);
        tournament.setUpdatedBy(userId);
        tournamentRepository.save(tournament);
    }
}
