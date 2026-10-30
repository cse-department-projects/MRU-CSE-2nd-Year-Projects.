package com.logistics.dto;

import com.logistics.model.Shipment;

public class ShipmentRequest {
    private String origin;
    private String destination;
    private String customerName;
    private double weightKg;
    private Shipment.Status status;
    private Long vehicleId;
    private Long driverId;

    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public double getWeightKg() { return weightKg; }
    public void setWeightKg(double weightKg) { this.weightKg = weightKg; }

    public Shipment.Status getStatus() { return status; }
    public void setStatus(Shipment.Status status) { this.status = status; }

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }

    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }
}
