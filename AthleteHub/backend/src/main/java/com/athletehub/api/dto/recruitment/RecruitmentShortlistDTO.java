package com.athletehub.api.dto.recruitment;

import com.athletehub.api.dto.AthleteResponseDTO;
import java.time.LocalDateTime;
import java.util.List;

public class RecruitmentShortlistDTO {
    private Integer id;
    private String name;
    private Integer recruiterId;
    private List<AthleteResponseDTO> athletes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getRecruiterId() { return recruiterId; }
    public void setRecruiterId(Integer recruiterId) { this.recruiterId = recruiterId; }
    public List<AthleteResponseDTO> getAthletes() { return athletes; }
    public void setAthletes(List<AthleteResponseDTO> athletes) { this.athletes = athletes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
