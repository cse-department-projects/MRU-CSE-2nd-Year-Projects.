package com.athletehub.api.service;

import com.athletehub.api.dto.MatchRequest;
import com.athletehub.api.entity.Athlete;
import com.athletehub.api.entity.Event;
import com.athletehub.api.entity.Match;
import com.athletehub.api.entity.Tournament;
import com.athletehub.api.entity.enums.MatchStatus;
import com.athletehub.api.repository.AthleteRepository;
import com.athletehub.api.repository.MatchRepository;
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
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class MatchService {

    private final MatchRepository matchRepository;
    private final TournamentRepository tournamentRepository;
    private final AthleteRepository athleteRepository;

    public MatchService(MatchRepository matchRepository, TournamentRepository tournamentRepository, AthleteRepository athleteRepository) {
        this.matchRepository = matchRepository;
        this.tournamentRepository = tournamentRepository;
        this.athleteRepository = athleteRepository;
    }

    @Transactional
    public Match createMatch(MatchRequest request, Integer userId) throws Exception {
        Tournament tournament = tournamentRepository.findById(request.getTournamentId())
                .orElseThrow(() -> new Exception("Tournament not found"));

        Event event = tournament.getEvent();

        if (request.getEndTime().isBefore(request.getStartTime()) || request.getEndTime().equals(request.getStartTime())) {
            throw new Exception("End Time must be after Start Time.");
        }

        if (request.getMatchDate().isBefore(event.getEventStartDate()) || request.getMatchDate().isAfter(event.getEventEndDate())) {
            throw new Exception("Matches cannot exist outside the parent Event dates.");
        }

        Athlete p1 = request.getParticipantOneId() != null ? athleteRepository.findById(request.getParticipantOneId()).orElse(null) : null;
        Athlete p2 = request.getParticipantTwoId() != null ? athleteRepository.findById(request.getParticipantTwoId()).orElse(null) : null;

        if (p1 != null) {
            EligibilityValidator.validateGender(tournament.getGenderCategory(), p1.getGender(),
                    p1.getFirstName() + " " + p1.getLastName(), "tournament match");
            EligibilityValidator.validateAge(tournament.getAgeCategory(), p1.getDateOfBirth(),
                    p1.getFirstName() + " " + p1.getLastName(), "tournament match");
        }
        if (p2 != null) {
            EligibilityValidator.validateGender(tournament.getGenderCategory(), p2.getGender(),
                    p2.getFirstName() + " " + p2.getLastName(), "tournament match");
            EligibilityValidator.validateAge(tournament.getAgeCategory(), p2.getDateOfBirth(),
                    p2.getFirstName() + " " + p2.getLastName(), "tournament match");
        }

        Match match = new Match();
        match.setTournament(tournament);
        match.setMatchNumber(request.getMatchNumber());
        match.setRound(request.getRound());
        match.setParticipantOne(p1);
        match.setParticipantTwo(p2);
        match.setVenue(request.getVenue());
        match.setMatchDate(request.getMatchDate());
        match.setStartTime(request.getStartTime());
        match.setEndTime(request.getEndTime());
        match.setRemarks(request.getRemarks());
        
        if (request.getStatus() != null) {
            match.setStatus(MatchStatus.valueOf(request.getStatus()));
        } else {
            match.setStatus(MatchStatus.SCHEDULED);
        }

        match.setCreatedBy(userId);
        match.setUpdatedBy(userId);

        match = matchRepository.save(match);
        match.setMatchCode(String.format("MAT%06d", match.getId()));
        return matchRepository.save(match);
    }

    @Transactional
    public Match updateMatch(Integer id, MatchRequest request, Integer userId) throws Exception {
        Match match = matchRepository.findById(id).orElseThrow(() -> new Exception("Match not found"));
        Tournament tournament = request.getTournamentId() != null 
                ? tournamentRepository.findById(request.getTournamentId()).orElse(match.getTournament())
                : match.getTournament();
        Event event = tournament != null ? tournament.getEvent() : null;

        if (request.getStartTime() != null && request.getEndTime() != null) {
            if (request.getEndTime().isBefore(request.getStartTime()) || request.getEndTime().equals(request.getStartTime())) {
                throw new Exception("End Time must be after Start Time.");
            }
        }

        if (request.getMatchDate() != null && event != null) {
            if (event.getEventStartDate() != null && event.getEventEndDate() != null) {
                if (request.getMatchDate().isBefore(event.getEventStartDate()) || request.getMatchDate().isAfter(event.getEventEndDate())) {
                    throw new Exception("Matches cannot exist outside the parent Event dates.");
                }
            }
        }

        if (tournament != null) {
            match.setTournament(tournament);
        }
        if (request.getMatchNumber() != null) {
            match.setMatchNumber(request.getMatchNumber());
        }
        if (request.getRound() != null) {
            match.setRound(request.getRound());
        }
        if (request.getParticipantOneId() != null) {
            Athlete p1 = athleteRepository.findById(request.getParticipantOneId()).orElse(null);
            if (p1 != null && tournament != null) {
                EligibilityValidator.validateGender(tournament.getGenderCategory(), p1.getGender(),
                        p1.getFirstName() + " " + p1.getLastName(), "tournament match");
                EligibilityValidator.validateAge(tournament.getAgeCategory(), p1.getDateOfBirth(),
                        p1.getFirstName() + " " + p1.getLastName(), "tournament match");
            }
            match.setParticipantOne(p1);
        }
        if (request.getParticipantTwoId() != null) {
            Athlete p2 = athleteRepository.findById(request.getParticipantTwoId()).orElse(null);
            if (p2 != null && tournament != null) {
                EligibilityValidator.validateGender(tournament.getGenderCategory(), p2.getGender(),
                        p2.getFirstName() + " " + p2.getLastName(), "tournament match");
                EligibilityValidator.validateAge(tournament.getAgeCategory(), p2.getDateOfBirth(),
                        p2.getFirstName() + " " + p2.getLastName(), "tournament match");
            }
            match.setParticipantTwo(p2);
        }
        if (request.getWinnerId() != null) {
            Athlete winner = athleteRepository.findById(request.getWinnerId()).orElse(null);
            match.setWinner(winner);
            
            // Automatic bracket advancement: advance winner to the linked next match
            if (winner != null && match.getNextMatch() != null) {
                Match next = match.getNextMatch();
                if (next.getPreviousMatchOne() != null && next.getPreviousMatchOne().getId().equals(match.getId())) {
                    next.setParticipantOne(winner);
                } else if (next.getPreviousMatchTwo() != null && next.getPreviousMatchTwo().getId().equals(match.getId())) {
                    next.setParticipantTwo(winner);
                }
                matchRepository.save(next);
            }
        }
        if (request.getVenue() != null) {
            match.setVenue(request.getVenue());
        }
        if (request.getMatchDate() != null) {
            match.setMatchDate(request.getMatchDate());
        }
        if (request.getStartTime() != null) {
            match.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            match.setEndTime(request.getEndTime());
        }
        if (request.getRemarks() != null) {
            match.setRemarks(request.getRemarks());
        }
        if (request.getStatus() != null) {
            match.setStatus(MatchStatus.valueOf(request.getStatus()));
        }
        match.setUpdatedBy(userId);

        return matchRepository.save(match);
    }

    public Match getMatchById(Integer id) throws Exception {
        return matchRepository.findById(id).orElseThrow(() -> new Exception("Match not found"));
    }

    public Page<Match> searchMatches(String search, Integer tournamentId, String status, Integer organizationId, int page, int pageSize, String sortBy, String sortDir) {
        Specification<Match> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDeleted")));

            if (status != null && !status.isEmpty()) {
                predicates.add(cb.equal(root.get("status"), MatchStatus.valueOf(status)));
            }
            if (tournamentId != null) {
                predicates.add(cb.equal(root.get("tournament").get("id"), tournamentId));
            }
            if (organizationId != null) {
                predicates.add(cb.equal(root.get("tournament").get("event").get("organization").get("id"), organizationId));
            }
            if (search != null && !search.isEmpty()) {
                String likeSearch = "%" + search + "%";
                predicates.add(cb.or(
                        cb.like(root.get("matchCode"), likeSearch),
                        cb.like(root.get("round"), likeSearch),
                        cb.like(root.get("venue"), likeSearch)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);
        return matchRepository.findAll(spec, pageable);
    }

    @Transactional
    public void deleteMatch(Integer id, Integer userId) throws Exception {
        Match match = matchRepository.findById(id).orElseThrow(() -> new Exception("Match not found"));
        match.setIsDeleted(true);
        match.setUpdatedBy(userId);
        matchRepository.save(match);
    }
}
