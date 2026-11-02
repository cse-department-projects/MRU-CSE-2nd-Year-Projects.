package com.athletehub.api.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class MatchRequest {
    private Integer tournamentId;
    private Integer matchNumber;
    private String round;
    private Integer participantOneId;
    private Integer participantTwoId;
    private String venue;
    private LocalDate matchDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer winnerId;
    private String status;
    private String remarks;

    // Getters and Setters
    public Integer getTournamentId() { return tournamentId; }
    public void setTournamentId(Integer tournamentId) { this.tournamentId = tournamentId; }

    public Integer getMatchNumber() { return matchNumber; }
    public void setMatchNumber(Integer matchNumber) { this.matchNumber = matchNumber; }

    public String getRound() { return round; }
    public void setRound(String round) { this.round = round; }

    public Integer getParticipantOneId() { return participantOneId; }
    public void setParticipantOneId(Integer participantOneId) { this.participantOneId = participantOneId; }

    public Integer getParticipantTwoId() { return participantTwoId; }
    public void setParticipantTwoId(Integer participantTwoId) { this.participantTwoId = participantTwoId; }

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

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
