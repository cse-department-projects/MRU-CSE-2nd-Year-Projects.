package com.athletehub.api.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class AthleteResponseDTO {
    private Integer id;
    private Integer userId;
    private String athleteCode;
    private String firstName;
    private String lastName;
    private String fullName; // Derived
    private LocalDate dateOfBirth;
    private Integer age; // Derived
    private String gender;
    private String bloodGroup;
    private String phone;
    private String email; // Derived from User
    private String address;
    private String city;
    private String state;
    private String country;
    private String emergencyContactName;
    private String emergencyContactNumber;
    private Double height;
    private Double weight;
    private String profilePhotoUrl;
    
    private SportDTO sport;
    
    private Integer organizationId;
    private String organizationName; // Derived
    private String assignedCoachName; // Derived
    private Integer assignedTeamId; // Derived
    private String assignedTeamName; // Derived

    private String status;
    private String medicalStatus;
    private Integer performanceRating;
    private String notes;
    private List<String> injuries;
    private List<String> achievements;

    private Integer profileCompletion; // Derived
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public String getAthleteCode() { return athleteCode; }
    public void setAthleteCode(String athleteCode) { this.athleteCode = athleteCode; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getEmergencyContactName() { return emergencyContactName; }
    public void setEmergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; }

    public String getEmergencyContactNumber() { return emergencyContactNumber; }
    public void setEmergencyContactNumber(String emergencyContactNumber) { this.emergencyContactNumber = emergencyContactNumber; }

    public Double getHeight() { return height; }
    public void setHeight(Double height) { this.height = height; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public String getProfilePhotoUrl() { return profilePhotoUrl; }
    public void setProfilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; }

    public SportDTO getSport() { return sport; }
    public void setSport(SportDTO sport) { this.sport = sport; }

    public Integer getOrganizationId() { return organizationId; }
    public void setOrganizationId(Integer organizationId) { this.organizationId = organizationId; }

    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }

    public String getAssignedCoachName() { return assignedCoachName; }
    public void setAssignedCoachName(String assignedCoachName) { this.assignedCoachName = assignedCoachName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMedicalStatus() { return medicalStatus; }
    public void setMedicalStatus(String medicalStatus) { this.medicalStatus = medicalStatus; }

    public Integer getPerformanceRating() { return performanceRating; }
    public void setPerformanceRating(Integer performanceRating) { this.performanceRating = performanceRating; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<String> getInjuries() { return injuries; }
    public void setInjuries(List<String> injuries) { this.injuries = injuries; }

    public List<String> getAchievements() { return achievements; }
    public void setAchievements(List<String> achievements) { this.achievements = achievements; }

    public Integer getProfileCompletion() { return profileCompletion; }
    public void setProfileCompletion(Integer profileCompletion) { this.profileCompletion = profileCompletion; }

    public Integer getAssignedTeamId() { return assignedTeamId; }
    public void setAssignedTeamId(Integer assignedTeamId) { this.assignedTeamId = assignedTeamId; }

    public String getAssignedTeamName() { return assignedTeamName; }
    public void setAssignedTeamName(String assignedTeamName) { this.assignedTeamName = assignedTeamName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
