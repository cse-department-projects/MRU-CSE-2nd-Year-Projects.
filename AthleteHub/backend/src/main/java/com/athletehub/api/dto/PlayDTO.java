package com.athletehub.api.dto;

import java.time.LocalDateTime;

public class PlayDTO {
    private Integer id;
    private Integer playbookId;
    private String title;
    private String description;
    private String canvasState;
    private LocalDateTime createdAt;

    public PlayDTO() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getPlaybookId() { return playbookId; }
    public void setPlaybookId(Integer playbookId) { this.playbookId = playbookId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCanvasState() { return canvasState; }
    public void setCanvasState(String canvasState) { this.canvasState = canvasState; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
