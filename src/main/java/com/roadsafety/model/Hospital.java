package com.roadsafety.model;

import jakarta.persistence.*;

@Entity
@Table(name = "hospitals")
public class Hospital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

    @Column(name = "emergency_contact", nullable = false, length = 20)
    private String emergencyContact;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(name = "available_ambulances")
    private Integer availableAmbulances = 5;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Transient
    private Double distanceFromUserKm;

    public Hospital() {}

    public Hospital(String name, String phoneNumber, String emergencyContact, Double latitude, Double longitude, String address, Integer availableAmbulances, Boolean isActive) {
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.emergencyContact = emergencyContact;
        this.latitude = latitude;
        this.longitude = longitude;
        this.address = address;
        this.availableAmbulances = availableAmbulances;
        this.isActive = isActive;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Integer getAvailableAmbulances() { return availableAmbulances; }
    public void setAvailableAmbulances(Integer availableAmbulances) { this.availableAmbulances = availableAmbulances; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Double getDistanceFromUserKm() { return distanceFromUserKm; }
    public void setDistanceFromUserKm(Double distanceFromUserKm) { this.distanceFromUserKm = distanceFromUserKm; }
}
