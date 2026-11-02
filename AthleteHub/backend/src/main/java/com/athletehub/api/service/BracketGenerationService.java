package com.athletehub.api.service;

import com.athletehub.api.entity.Athlete;
import com.athletehub.api.entity.AthleteRegistration;
import com.athletehub.api.entity.Match;
import com.athletehub.api.entity.Tournament;
import com.athletehub.api.entity.enums.MatchStatus;
import com.athletehub.api.entity.enums.RegistrationStatus;
import com.athletehub.api.repository.AthleteRegistrationRepository;
import com.athletehub.api.repository.MatchRepository;
import com.athletehub.api.repository.TournamentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import com.athletehub.api.entity.TeamMember;
import com.athletehub.api.entity.TournamentTeam;
import com.athletehub.api.repository.TeamMemberRepository;
import com.athletehub.api.repository.TournamentTeamRepository;
import java.util.stream.Collectors;

@Service
public class BracketGenerationService {

    private final MatchRepository matchRepository;
    private final TournamentRepository tournamentRepository;
    private final AthleteRegistrationRepository registrationRepository;
    private final TournamentTeamRepository tournamentTeamRepository;
    private final TeamMemberRepository teamMemberRepository;

    public BracketGenerationService(MatchRepository matchRepository,
                                    TournamentRepository tournamentRepository,
                                    AthleteRegistrationRepository registrationRepository,
                                    TournamentTeamRepository tournamentTeamRepository,
                                    TeamMemberRepository teamMemberRepository) {
        this.matchRepository = matchRepository;
        this.tournamentRepository = tournamentRepository;
        this.registrationRepository = registrationRepository;
        this.tournamentTeamRepository = tournamentTeamRepository;
        this.teamMemberRepository = teamMemberRepository;
    }

    @Transactional
    public List<Match> generateBracket(Integer tournamentId, Integer userId) throws Exception {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new Exception("Tournament not found"));

        // Check if matches already exist
        if (matchRepository.countByTournamentId(tournamentId) > 0) {
            throw new Exception("Bracket already exists for this tournament");
        }

        // Fetch approved participants from registrations
        List<AthleteRegistration> registrations = registrationRepository.findByTournamentId(tournamentId).stream()
                .filter(reg -> reg.getStatus() == RegistrationStatus.APPROVED)
                .collect(Collectors.toList());

        List<Athlete> athletes = registrations.stream().map(AthleteRegistration::getAthlete).collect(Collectors.toList());

        // If not enough direct registrations, check tournament teams
        if (athletes.size() < 2) {
            List<TournamentTeam> tTeams = tournamentTeamRepository.findByTournamentIdWithTeamDetails(tournamentId);
            if (tTeams.size() >= 2) {
                athletes.clear();
                for (TournamentTeam tt : tTeams) {
                    List<TeamMember> members = teamMemberRepository.findByTeamIdAndStatus(tt.getTeam().getId(), "ACTIVE");
                    if (!members.isEmpty() && members.get(0).getAthlete() != null) {
                        athletes.add(members.get(0).getAthlete());
                    }
                }
            }
        }

        if (athletes.size() < 2) {
            throw new Exception("At least 2 approved teams or participants are required to generate bracket. Please ensure at least 2 teams with active members are registered.");
        }

        // Shuffle for random seeding
        Collections.shuffle(athletes);

        // Calculate power of 2 for bracket size
        int n = athletes.size();
        int bracketSize = 1;
        while (bracketSize < n) {
            bracketSize *= 2;
        }

        int byes = bracketSize - n;
        
        // Setup initial round (leaf nodes)
        List<Match> currentRoundMatches = new ArrayList<>();
        int matchCounter = 1;
        
        // Add padding with nulls to represent byes
        List<Athlete> paddedAthletes = new ArrayList<>(athletes);
        for (int i = 0; i < byes; i++) {
            paddedAthletes.add(null);
        }

        LocalDate defaultDate = tournament.getStartDate() != null ? tournament.getStartDate() :
                (tournament.getEvent() != null && tournament.getEvent().getEventStartDate() != null ? tournament.getEvent().getEventStartDate() : LocalDate.now());
        String defaultVenue = tournament.getEvent() != null && tournament.getEvent().getVenue() != null
                && !tournament.getEvent().getVenue().trim().isEmpty()
                ? tournament.getEvent().getVenue()
                : "Main Arena";

        int firstRoundMatchCount = bracketSize / 2;

        // First Round creation
        for (int i = 0; i < firstRoundMatchCount; i++) {
            Match match = new Match();
            match.setTournament(tournament);
            match.setMatchNumber(matchCounter++);
            match.setRound(firstRoundMatchCount == 1 ? "Finals" : "Round 1");
            match.setParticipantOne(paddedAthletes.get(i * 2));
            match.setParticipantTwo(paddedAthletes.get(i * 2 + 1));
            match.setVenue(defaultVenue);
            match.setMatchDate(defaultDate);
            match.setStartTime(LocalTime.of(9, 0).plusMinutes((i % 6) * 45));
            match.setEndTime(LocalTime.of(9, 40).plusMinutes((i % 6) * 45));
            match.setStatus(MatchStatus.SCHEDULED);
            match.setCreatedBy(userId);

            // Auto-advance if there is a bye
            if (match.getParticipantOne() == null && match.getParticipantTwo() != null) {
                match.setWinner(match.getParticipantTwo());
                match.setStatus(MatchStatus.COMPLETED);
            } else if (match.getParticipantTwo() == null && match.getParticipantOne() != null) {
                match.setWinner(match.getParticipantOne());
                match.setStatus(MatchStatus.COMPLETED);
            } else if (match.getParticipantOne() == null && match.getParticipantTwo() == null) {
                match.setStatus(MatchStatus.COMPLETED);
            }

            match = matchRepository.save(match);
            match.setMatchCode(String.format("MAT%06d", match.getId()));
            match = matchRepository.save(match);
            currentRoundMatches.add(match);
        }

        // Build subsequent rounds bottom-up
        int roundNum = 2;
        while (currentRoundMatches.size() > 1) {
            List<Match> nextRoundMatches = new ArrayList<>();
            int nextRoundSize = currentRoundMatches.size() / 2;
            for (int i = 0; i < currentRoundMatches.size(); i += 2) {
                Match prev1 = currentRoundMatches.get(i);
                Match prev2 = currentRoundMatches.get(i + 1);

                Match match = new Match();
                match.setTournament(tournament);
                match.setMatchNumber(matchCounter++);
                match.setRound(nextRoundSize == 1 ? "Finals" : "Round " + roundNum);
                match.setPreviousMatchOne(prev1);
                match.setPreviousMatchTwo(prev2);
                match.setVenue(defaultVenue);
                match.setMatchDate(defaultDate);
                match.setStartTime(LocalTime.of(14, 0).plusMinutes(((i / 2) % 4) * 60));
                match.setEndTime(LocalTime.of(14, 50).plusMinutes(((i / 2) % 4) * 60));
                match.setStatus(MatchStatus.SCHEDULED);
                match.setCreatedBy(userId);

                // Auto-advance logic if previous matches had byes
                if (prev1.getWinner() != null) {
                    match.setParticipantOne(prev1.getWinner());
                }
                if (prev2.getWinner() != null) {
                    match.setParticipantTwo(prev2.getWinner());
                }

                match = matchRepository.save(match);
                match.setMatchCode(String.format("MAT%06d", match.getId()));
                match = matchRepository.save(match);
                nextRoundMatches.add(match);
                
                // Link previous matches to this new match
                prev1.setNextMatch(match);
                prev2.setNextMatch(match);
                matchRepository.save(prev1);
                matchRepository.save(prev2);
            }
            currentRoundMatches = nextRoundMatches;
            roundNum++;
        }
        
        tournament.setStatus(com.athletehub.api.entity.enums.TournamentStatus.ACTIVE);
        tournamentRepository.save(tournament);

        return matchRepository.findByTournamentId(tournamentId);
    }
    
    public List<Match> getBracket(Integer tournamentId) {
        return matchRepository.findByTournamentId(tournamentId);
    }
}

