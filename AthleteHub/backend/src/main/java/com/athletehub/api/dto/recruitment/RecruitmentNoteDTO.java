package com.athletehub.api.dto.recruitment;

import java.time.LocalDateTime;

public class RecruitmentNoteDTO {
    private Integer id;
    private Integer prospectId;
    private Integer recruiterId;
    private String recruiterName;
    private String noteText;
    private Integer rating;
    private LocalDateTime createdAt;
    
    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getProspectId() { return prospectId; }
    public void setProspectId(Integer prospectId) { this.prospectId = prospectId; }
    public Integer getRecruiterId() { return recruiterId; }
    public void setRecruiterId(Integer recruiterId) { this.recruiterId = recruiterId; }
    public String getRecruiterName() { return recruiterName; }
    public void setRecruiterName(String recruiterName) { this.recruiterName = recruiterName; }
    public String getNoteText() { return noteText; }
    public void setNoteText(String noteText) { this.noteText = noteText; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
