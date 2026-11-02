package com.athletehub.api.dto;

import java.time.LocalDateTime;
import java.util.List;

public class TeamDTO {
    private Integer id;
    private String teamCode;
    private String name;
    private String description;
    private String gender;
    private String ageGroup;
    private String status;
    private Integer organizationId;
    private String organizationName;
    private Integer coachId;
    private String coachName;
    private Integer sportId;
    private String sportName;
    private Integer createdByAthleteId;
    private String createdByAthleteName;
    private String rejectionReason;
    private int memberCount;
    private List<TeamMemberDTO> members;
    private List<TeamMemberDTO> joinRequests;
    private int pendingRequestsCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getTeamCode() { return teamCode; }
    public void setTeamCode(String teamCode) { this.teamCode = teamCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getAgeGroup() { return ageGroup; }
    public void setAgeGroup(String ageGroup) { this.ageGroup = ageGroup; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getOrganizationId() { return organizationId; }
    public void setOrganizationId(Integer organizationId) { this.organizationId = organizationId; }

    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }

    public Integer getCoachId() { return coachId; }
    public void setCoachId(Integer coachId) { this.coachId = coachId; }

    public String getCoachName() { return coachName; }
    public void setCoachName(String coachName) { this.coachName = coachName; }

    public Integer getSportId() { return sportId; }
    public void setSportId(Integer sportId) { this.sportId = sportId; }

    public String getSportName() { return sportName; }
    public void setSportName(String sportName) { this.sportName = sportName; }

    public Integer getCreatedByAthleteId() { return createdByAthleteId; }
    public void setCreatedByAthleteId(Integer createdByAthleteId) { this.createdByAthleteId = createdByAthleteId; }

    public String getCreatedByAthleteName() { return createdByAthleteName; }
    public void setCreatedByAthleteName(String createdByAthleteName) { this.createdByAthleteName = createdByAthleteName; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public int getMemberCount() { return memberCount; }
    public void setMemberCount(int memberCount) { this.memberCount = memberCount; }

    public List<TeamMemberDTO> getMembers() { return members; }
    public void setMembers(List<TeamMemberDTO> members) { this.members = members; }

    public List<TeamMemberDTO> getJoinRequests() { return joinRequests; }
    public void setJoinRequests(List<TeamMemberDTO> joinRequests) { this.joinRequests = joinRequests; }

    public int getPendingRequestsCount() { return pendingRequestsCount; }
    public void setPendingRequestsCount(int pendingRequestsCount) { this.pendingRequestsCount = pendingRequestsCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
