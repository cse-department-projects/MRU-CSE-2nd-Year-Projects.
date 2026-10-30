package com.logistics.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "drivers")
public class Driver {

    public enum Status { AVAILABLE, ON_TRIP, OFF_DUTY }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @Column(unique = true, nullable = false)
    private String licenseNumber;

    private String phone;

    @Enumerated(EnumType.STRING)
    private Status status;

    public Driver() {}

    public Driver(String name, String licenseNumber, String phone, Status status) {
        this.name = name;
        this.licenseNumber = licenseNumber;
        this.phone = phone;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
}
