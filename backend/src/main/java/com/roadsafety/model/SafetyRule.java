package com.roadsafety.model;

import jakarta.persistence.*;

@Entity
@Table(name = "safety_rules")
public class SafetyRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(name = "icon_name", length = 50)
    private String iconName;

    @Column(length = 100)
    private String penalty;

    public SafetyRule() {}

    public SafetyRule(String category, String title, String description, String iconName, String penalty) {
        this.category = category;
        this.title = title;
        this.description = description;
        this.iconName = iconName;
        this.penalty = penalty;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIconName() { return iconName; }
    public void setIconName(String iconName) { this.iconName = iconName; }

    public String getPenalty() { return penalty; }
    public void setPenalty(String penalty) { this.penalty = penalty; }
}
