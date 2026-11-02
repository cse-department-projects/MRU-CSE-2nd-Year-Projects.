package com.athletehub.api.dto;

public class TeamRequest {
    private String name;
    private String description;
    private String gender;
    private String ageGroup;
    private String status;
    private Integer organizationId;
    private Integer coachId;
    private Integer sportId;
    private java.util.List<Integer> memberAthleteIds;

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

    public Integer getCoachId() { return coachId; }
    public void setCoachId(Integer coachId) { this.coachId = coachId; }

    public Integer getSportId() { return sportId; }
    public void setSportId(Integer sportId) { this.sportId = sportId; }

    public java.util.List<Integer> getMemberAthleteIds() { return memberAthleteIds; }
    public void setMemberAthleteIds(java.util.List<Integer> memberAthleteIds) { this.memberAthleteIds = memberAthleteIds; }
}
