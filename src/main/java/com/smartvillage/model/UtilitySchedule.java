package com.smartvillage.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "utility_schedules")
public class UtilitySchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String utilityType; // WATER_SUPPLY, POWER_OUTAGE, WASTE_COLLECTION, STREET_MAINTENANCE

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 150)
    private String areaAffected;

    @Column(length = 50)
    private String scheduleDate;

    @Column(length = 30)
    private String status = "SCHEDULED"; // SCHEDULED, IN_PROGRESS, COMPLETED, DELAYED

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(length = 100)
    private String contactPerson;

    private LocalDateTime createdAt = LocalDateTime.now();

    public UtilitySchedule() {}

    public UtilitySchedule(String utilityType, String title, String areaAffected, String scheduleDate, String status, String details) {
        this.utilityType = utilityType;
        this.title = title;
        this.areaAffected = areaAffected;
        this.scheduleDate = scheduleDate;
        this.status = status;
        this.details = details;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUtilityType() { return utilityType; }
    public void setUtilityType(String utilityType) { this.utilityType = utilityType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAreaAffected() { return areaAffected; }
    public void setAreaAffected(String areaAffected) { this.areaAffected = areaAffected; }

    public String getScheduleDate() { return scheduleDate; }
    public void setScheduleDate(String scheduleDate) { this.scheduleDate = scheduleDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
