package com.athletehub.api.service;

import com.athletehub.api.dto.AthleteRegistrationRequest;
import com.athletehub.api.entity.Athlete;
import com.athletehub.api.entity.AthleteRegistration;
import com.athletehub.api.entity.Event;
import com.athletehub.api.entity.Tournament;
import com.athletehub.api.entity.enums.RegistrationStatus;
import com.athletehub.api.repository.AthleteRegistrationRepository;
import com.athletehub.api.repository.AthleteRepository;
import com.athletehub.api.repository.TournamentRepository;
import com.athletehub.api.util.EligibilityValidator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AthleteRegistrationService {

    private final AthleteRegistrationRepository registrationRepository;
    private final TournamentRepository tournamentRepository;
    private final AthleteRepository athleteRepository;

    public AthleteRegistrationService(AthleteRegistrationRepository registrationRepository, TournamentRepository tournamentRepository, AthleteRepository athleteRepository) {
        this.registrationRepository = registrationRepository;
        this.tournamentRepository = tournamentRepository;
        this.athleteRepository = athleteRepository;
    }

    @Transactional
    public AthleteRegistration registerAthlete(AthleteRegistrationRequest request, Integer userId) throws Exception {
        Tournament tournament = tournamentRepository.findById(request.getTournamentId())
                .orElseThrow(() -> new Exception("Tournament not found"));

        Athlete athlete = athleteRepository.findById(request.getAthleteId())
                .orElseThrow(() -> new Exception("Athlete not found"));

        if (registrationRepository.existsByAthleteIdAndTournamentId(athlete.getId(), tournament.getId())) {
            throw new Exception("Athlete cannot register twice for the same Tournament.");
        }

        // Gender bifurcation validation
        EligibilityValidator.validateGender(tournament.getGenderCategory(), athlete.getGender(),
                athlete.getFirstName() + " " + athlete.getLastName(), "tournament");

        // Age category validation
        EligibilityValidator.validateAge(tournament.getAgeCategory(), athlete.getDateOfBirth(),
                athlete.getFirstName() + " " + athlete.getLastName(), "tournament");

        Event event = tournament.getEvent();
        if (event != null && event.getRegistrationStartDate() != null && event.getRegistrationEndDate() != null) {
            LocalDate today = LocalDate.now();
            if (today.isBefore(event.getRegistrationStartDate()) || today.isAfter(event.getRegistrationEndDate())) {
                throw new Exception("Registration is only allowed during the registration period (" + event.getRegistrationStartDate() + " to " + event.getRegistrationEndDate() + ").");
            }
        }

        if (tournament.getMaxParticipants() != null) {
            long currentCount = registrationRepository.countByTournamentId(tournament.getId());
            if (currentCount >= tournament.getMaxParticipants()) {
                throw new Exception("Tournament capacity has been exceeded.");
            }
        }

        AthleteRegistration registration = new AthleteRegistration();
        registration.setTournament(tournament);
        registration.setAthlete(athlete);
        registration.setRemarks(request.getRemarks());
        registration.setStatus(RegistrationStatus.PENDING);
        registration.setRegistrationDate(LocalDateTime.now());
        registration.setCreatedBy(userId);
        registration.setUpdatedBy(userId);

        registration = registrationRepository.save(registration);
        registration.setRegistrationCode(String.format("REG%06d", registration.getId()));
        return registrationRepository.save(registration);
    }

    @Transactional
    public AthleteRegistration updateRegistrationStatus(Integer id, String status, String remarks, Integer userId) throws Exception {
        AthleteRegistration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new Exception("Registration not found"));

        registration.setStatus(RegistrationStatus.valueOf(status));
        if (remarks != null) {
            registration.setRemarks(remarks);
        }
        registration.setUpdatedBy(userId);

        return registrationRepository.save(registration);
    }

    public AthleteRegistration getRegistrationById(Integer id) throws Exception {
        return registrationRepository.findById(id).orElseThrow(() -> new Exception("Registration not found"));
    }

    public Page<AthleteRegistration> searchRegistrations(String search, Integer tournamentId, Integer athleteId, String status, Integer organizationId, int page, int pageSize, String sortBy, String sortDir) {
        Specification<AthleteRegistration> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDeleted")));

            if (status != null && !status.isEmpty()) {
                predicates.add(cb.equal(root.get("status"), RegistrationStatus.valueOf(status)));
            }
            if (tournamentId != null) {
                predicates.add(cb.equal(root.get("tournament").get("id"), tournamentId));
            }
            if (athleteId != null) {
                predicates.add(cb.equal(root.get("athlete").get("id"), athleteId));
            }
            if (organizationId != null) {
                predicates.add(cb.equal(root.get("tournament").get("event").get("organization").get("id"), organizationId));
            }
            if (search != null && !search.isEmpty()) {
                String likeSearch = "%" + search + "%";
                predicates.add(cb.or(
                        cb.like(root.get("registrationCode"), likeSearch),
                        cb.like(root.get("athlete").get("firstName"), likeSearch),
                        cb.like(root.get("athlete").get("lastName"), likeSearch)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);
        return registrationRepository.findAll(spec, pageable);
    }

    @Transactional
    public void deleteRegistration(Integer id, Integer userId) throws Exception {
        AthleteRegistration registration = registrationRepository.findById(id).orElseThrow(() -> new Exception("Registration not found"));
        registration.setIsDeleted(true);
        registration.setUpdatedBy(userId);
        registrationRepository.save(registration);
    }
}
