package com.logistics.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "vehicles")
public class Vehicle {

    public enum VehicleType { TRUCK, VAN, BIKE, CONTAINER }
    public enum Status { AVAILABLE, IN_USE, MAINTENANCE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(unique = true, nullable = false)
    private String vehicleNumber;

    @Enumerated(EnumType.STRING)
    private VehicleType type;

    @Positive
    private double capacityKg;

    @Enumerated(EnumType.STRING)
    private Status status;

    public Vehicle() {}

    public Vehicle(String vehicleNumber, VehicleType type, double capacityKg, Status status) {
        this.vehicleNumber = vehicleNumber;
        this.type = type;
        this.capacityKg = capacityKg;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public VehicleType getType() { return type; }
    public void setType(VehicleType type) { this.type = type; }

    public double getCapacityKg() { return capacityKg; }
    public void setCapacityKg(double capacityKg) { this.capacityKg = capacityKg; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
}
