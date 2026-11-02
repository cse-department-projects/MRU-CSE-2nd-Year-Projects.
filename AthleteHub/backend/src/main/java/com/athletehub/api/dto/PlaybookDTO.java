package com.athletehub.api.dto;

import java.time.LocalDateTime;
import java.util.List;

public class PlaybookDTO {
    private Integer id;
    private String title;
    private String description;
    private Integer coachId;
    private List<PlayDTO> plays;
    private LocalDateTime createdAt;

    public PlaybookDTO() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getCoachId() { return coachId; }
    public void setCoachId(Integer coachId) { this.coachId = coachId; }

    public List<PlayDTO> getPlays() { return plays; }
    public void setPlays(List<PlayDTO> plays) { this.plays = plays; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
