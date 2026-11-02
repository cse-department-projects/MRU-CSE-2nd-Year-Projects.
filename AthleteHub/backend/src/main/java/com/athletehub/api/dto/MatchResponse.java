package com.athletehub.api.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class MatchResponse {
    private Integer id;
    private String matchCode;
    private Integer tournamentId;
    private String tournamentName;
    private Integer eventId;
    private String eventName;
    private Integer matchNumber;
    private String round;
    private Integer participantOneId;
    private String participantOneName;
    private Integer participantTwoId;
    private String participantTwoName;
    private String venue;
    private LocalDate matchDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer winnerId;
    private String winnerName;
    private String status;
    private String remarks;
    private Integer previousMatchOneId;
    private Integer previousMatchTwoId;
    private Integer nextMatchId;

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getMatchCode() { return matchCode; }
    public void setMatchCode(String matchCode) { this.matchCode = matchCode; }

    public Integer getTournamentId() { return tournamentId; }
    public void setTournamentId(Integer tournamentId) { this.tournamentId = tournamentId; }

    public String getTournamentName() { return tournamentName; }
    public void setTournamentName(String tournamentName) { this.tournamentName = tournamentName; }

    public Integer getEventId() { return eventId; }
    public void setEventId(Integer eventId) { this.eventId = eventId; }

    public String getEventName() { return eventName; }
    public void setEventName(String eventName) { this.eventName = eventName; }

    public Integer getMatchNumber() { return matchNumber; }
    public void setMatchNumber(Integer matchNumber) { this.matchNumber = matchNumber; }

    public String getRound() { return round; }
    public void setRound(String round) { this.round = round; }

    public Integer getParticipantOneId() { return participantOneId; }
    public void setParticipantOneId(Integer participantOneId) { this.participantOneId = participantOneId; }

    public String getParticipantOneName() { return participantOneName; }
    public void setParticipantOneName(String participantOneName) { this.participantOneName = participantOneName; }

    public Integer getParticipantTwoId() { return participantTwoId; }
    public void setParticipantTwoId(Integer participantTwoId) { this.participantTwoId = participantTwoId; }

    public String getParticipantTwoName() { return participantTwoName; }
    public void setParticipantTwoName(String participantTwoName) { this.participantTwoName = participantTwoName; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public LocalDate getMatchDate() { return matchDate; }
    public void setMatchDate(LocalDate matchDate) { this.matchDate = matchDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public Integer getWinnerId() { return winnerId; }
    public void setWinnerId(Integer winnerId) { this.winnerId = winnerId; }

    public String getWinnerName() { return winnerName; }
    public void setWinnerName(String winnerName) { this.winnerName = winnerName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public Integer getPreviousMatchOneId() { return previousMatchOneId; }
    public void setPreviousMatchOneId(Integer previousMatchOneId) { this.previousMatchOneId = previousMatchOneId; }

    public Integer getPreviousMatchTwoId() { return previousMatchTwoId; }
    public void setPreviousMatchTwoId(Integer previousMatchTwoId) { this.previousMatchTwoId = previousMatchTwoId; }

    public Integer getNextMatchId() { return nextMatchId; }
    public void setNextMatchId(Integer nextMatchId) { this.nextMatchId = nextMatchId; }
}
