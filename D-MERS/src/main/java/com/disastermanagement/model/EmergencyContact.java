package com.disastermanagement.model;

public class EmergencyContact {
    private int id;
    private String category; // Police, Fire & Rescue, Ambulance, Disaster Mgmt, Hospital, Local Helpline
    private String title;
    private String phoneNumber;
    private String location;
    private String notes;
    private boolean isOfficial;

    public EmergencyContact() {
        this.isOfficial = true;
    }

    public EmergencyContact(String category, String title, String phoneNumber, String location, String notes) {
        this.category = category;
        this.title = title;
        this.phoneNumber = phoneNumber;
        this.location = location;
        this.notes = notes;
        this.isOfficial = true;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public boolean isOfficial() { return isOfficial; }
    public void setOfficial(boolean official) { isOfficial = official; }
}
