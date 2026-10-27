package com.disastermanagement.model;

import java.sql.Timestamp;

public class Shelter {
    private int shelterId;
    private String name;
    private String address;
    private String location;
    private int capacity;
    private int currentOccupancy;
    private boolean foodAvailable;
    private boolean waterAvailable;
    private boolean medicalFacility;
    private String contactNumber;
    private Timestamp createdAt;

    public Shelter() {}

    public Shelter(int shelterId, String name, String location, int capacity, int currentOccupancy, boolean foodAvailable, boolean waterAvailable, boolean medicalFacility, String contactNumber, Timestamp createdAt) {
        this.shelterId = shelterId;
        this.name = name;
        this.address = location;
        this.location = location;
        this.capacity = capacity;
        this.currentOccupancy = currentOccupancy;
        this.foodAvailable = foodAvailable;
        this.waterAvailable = waterAvailable;
        this.medicalFacility = medicalFacility;
        this.contactNumber = contactNumber;
        this.createdAt = createdAt;
    }

    public int getAvailableSpaces() {
        return Math.max(0, capacity - currentOccupancy);
    }

    public double getOccupancyPercentage() {
        if (capacity <= 0) return 1.0;
        return Math.min(1.0, (double) currentOccupancy / capacity);
    }

    public String getOccupancyStatus() {
        if (capacity <= 0) return "Full";
        double ratio = getOccupancyPercentage();
        if (ratio >= 0.9) return "Full";
        if (ratio >= 0.7) return "Nearly Full";
        return "Available";
    }

    public String getStatusColorHex() {
        double ratio = getOccupancyPercentage();
        if (ratio >= 0.9) return "#DC2626"; // Red - Full
        if (ratio >= 0.7) return "#EA580C"; // Orange/Yellow - Nearly Full
        return "#059669"; // Green - Available
    }

    // Getters & Setters
    public int getShelterId() { return shelterId; }
    public void setShelterId(int shelterId) { this.shelterId = shelterId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address != null ? address : location; }
    public void setAddress(String address) { this.address = address; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }

    public int getCurrentOccupancy() { return currentOccupancy; }
    public void setCurrentOccupancy(int currentOccupancy) { this.currentOccupancy = currentOccupancy; }

    public boolean isFoodAvailable() { return foodAvailable; }
    public void setFoodAvailable(boolean foodAvailable) { this.foodAvailable = foodAvailable; }

    public boolean isWaterAvailable() { return waterAvailable; }
    public void setWaterAvailable(boolean waterAvailable) { this.waterAvailable = waterAvailable; }

    public boolean isMedicalFacility() { return medicalFacility; }
    public void setMedicalFacility(boolean medicalFacility) { this.medicalFacility = medicalFacility; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
