package com.smartvillage.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 50)
    private String category = "GENERAL"; // GRAM_SABHA, HEALTH, SCHEME, FESTIVAL, WEATHER

    @Column(length = 20)
    private String priority = "NORMAL"; // NORMAL, HIGH, URGENT

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(length = 50)
    private String targetAudience = "ALL"; // ALL, FARMERS, SENIOR_CITIZENS, YOUTH

    private LocalDateTime postedDate = LocalDateTime.now();

    private Boolean active = true;

    public Announcement() {}

    public Announcement(String title, String category, String priority, String content, String targetAudience) {
        this.title = title;
        this.category = category;
        this.priority = priority;
        this.content = content;
        this.targetAudience = targetAudience;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getTargetAudience() { return targetAudience; }
    public void setTargetAudience(String targetAudience) { this.targetAudience = targetAudience; }

    public LocalDateTime getPostedDate() { return postedDate; }
    public void setPostedDate(LocalDateTime postedDate) { this.postedDate = postedDate; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
