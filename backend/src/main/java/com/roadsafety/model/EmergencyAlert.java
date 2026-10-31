package com.roadsafety.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "emergency_alerts")
public class EmergencyAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "victim_name", length = 100)
    private String victimName = "Accident Victim / Anonymous User";

    @Column(name = "victim_phone", nullable = false, length = 20)
    private String victimPhone;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(name = "address_details", length = 500)
    private String addressDetails;

    @Column(name = "medical_notes", length = 500)
    private String medicalNotes;

    @Column(length = 30)
    private String status = "PENDING"; // PENDING, ACCEPTED, AMBULANCE_DISPATCHED, RESOLVED

    @Column(name = "assigned_hospital_id")
    private Long assignedHospitalId;

    @Column(name = "assigned_hospital_name", length = 150)
    private String assignedHospitalName;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public EmergencyAlert() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getVictimName() { return victimName; }
    public void setVictimName(String victimName) { this.victimName = victimName; }

    public String getVictimPhone() { return victimPhone; }
    public void setVictimPhone(String victimPhone) { this.victimPhone = victimPhone; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getAddressDetails() { return addressDetails; }
    public void setAddressDetails(String addressDetails) { this.addressDetails = addressDetails; }

    public String getMedicalNotes() { return medicalNotes; }
    public void setMedicalNotes(String medicalNotes) { this.medicalNotes = medicalNotes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getAssignedHospitalId() { return assignedHospitalId; }
    public void setAssignedHospitalId(Long assignedHospitalId) { this.assignedHospitalId = assignedHospitalId; }

    public String getAssignedHospitalName() { return assignedHospitalName; }
    public void setAssignedHospitalName(String assignedHospitalName) { this.assignedHospitalName = assignedHospitalName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
