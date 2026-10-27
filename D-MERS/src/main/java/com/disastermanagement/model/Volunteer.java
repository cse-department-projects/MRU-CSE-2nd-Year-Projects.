package com.disastermanagement.model;

public class Volunteer {
    public enum Skill {
        FIRST_AID("First Aid"),
        MEDICAL_ASSISTANCE("Medical Assistance"),
        FOOD_DISTRIBUTION("Food Distribution"),
        RESCUE_SUPPORT("Rescue Support"),
        TRANSPORTATION("Transportation"),
        COMMUNICATION("Communication");

        private final String label;
        Skill(String label) { this.label = label; }
        public String getLabel() { return label; }
        public static Skill fromString(String text) {
            if (text == null) return FIRST_AID;
            for (Skill s : values()) {
                if (s.name().equalsIgnoreCase(text) || s.getLabel().equalsIgnoreCase(text)) return s;
            }
            return FIRST_AID;
        }
    }

    public enum Availability {
        AVAILABLE, BUSY, UNAVAILABLE;
        public static Availability fromString(String text) {
            if (text == null) return AVAILABLE;
            for (Availability a : values()) {
                if (a.name().equalsIgnoreCase(text)) return a;
            }
            return AVAILABLE;
        }
    }

    private int volunteerId;
    private int userId;
    private String fullName;
    private String phone;
    private String email;
    private Skill skill;
    private Availability availability;
    private String location;
    private int activeTasksCount;

    public Volunteer() {}

    public Volunteer(int volunteerId, int userId, String phone, String email, Skill skill, Availability availability, String location, int activeTasksCount) {
        this.volunteerId = volunteerId;
        this.userId = userId;
        this.phone = phone;
        this.email = email;
        this.skill = skill;
        this.availability = availability;
        this.location = location;
        this.activeTasksCount = activeTasksCount;
    }

    // Getters & Setters
    public int getVolunteerId() { return volunteerId; }
    public void setVolunteerId(int volunteerId) { this.volunteerId = volunteerId; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }

    public Availability getAvailability() { return availability; }
    public void setAvailability(Availability availability) { this.availability = availability; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public int getActiveTasksCount() { return activeTasksCount; }
    public void setActiveTasksCount(int activeTasksCount) { this.activeTasksCount = activeTasksCount; }

    @Override
    public String toString() {
        return (fullName != null ? fullName : "Volunteer #" + volunteerId) + " (" + skill.getLabel() + ")";
    }
}
