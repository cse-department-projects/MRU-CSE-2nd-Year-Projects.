package com.athletehub.api.dto.recruitment;

import com.athletehub.api.dto.AthleteResponseDTO;
import java.time.LocalDateTime;

public class RecruitmentProspectDTO {
    private Integer id;
    private AthleteResponseDTO athlete;
    private Integer recruiterId;
    private Integer organizationId;
    private String stage;
    private Integer rating;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public AthleteResponseDTO getAthlete() { return athlete; }
    public void setAthlete(AthleteResponseDTO athlete) { this.athlete = athlete; }
    public Integer getRecruiterId() { return recruiterId; }
    public void setRecruiterId(Integer recruiterId) { this.recruiterId = recruiterId; }
    public Integer getOrganizationId() { return organizationId; }
    public void setOrganizationId(Integer organizationId) { this.organizationId = organizationId; }
    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
