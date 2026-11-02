package com.athletehub.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "plays")
public class Play {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "playbook_id", nullable = false)
    private Playbook playbook;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "canvas_state", columnDefinition = "LONGTEXT")
    private String canvasState; // JSON or Base64 of the drawn play

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Play() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Playbook getPlaybook() { return playbook; }
    public void setPlaybook(Playbook playbook) { this.playbook = playbook; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCanvasState() { return canvasState; }
    public void setCanvasState(String canvasState) { this.canvasState = canvasState; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
