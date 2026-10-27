package com.disastermanagement.model;

import java.sql.Date;
import java.sql.Timestamp;

public class MissingPerson {
    public enum Gender {
        MALE, FEMALE, OTHER;
        public static Gender fromString(String text) {
            if (text == null) return OTHER;
            for (Gender g : values()) {
                if (g.name().equalsIgnoreCase(text)) return g;
            }
            return OTHER;
        }
    }

    public enum PersonStatus {
        MISSING, FOUND;
        public static PersonStatus fromString(String text) {
            if (text == null) return MISSING;
            for (PersonStatus s : values()) {
                if (s.name().equalsIgnoreCase(text)) return s;
            }
            return MISSING;
        }
    }

    private int personId;
    private int reporterId;
    private String name;
    private int age;
    private Gender gender;
    private String lastSeenLocation;
    private Date dateLastSeen;
    private String description;
    private String contactInfo;
    private String photoPath;
    private PersonStatus status;
    private Timestamp createdAt;

    public MissingPerson() {}

    public MissingPerson(int personId, int reporterId, String name, int age, Gender gender, String lastSeenLocation, Date dateLastSeen, String description, String contactInfo, String photoPath, PersonStatus status, Timestamp createdAt) {
        this.personId = personId;
        this.reporterId = reporterId;
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.lastSeenLocation = lastSeenLocation;
        this.dateLastSeen = dateLastSeen;
        this.description = description;
        this.contactInfo = contactInfo;
        this.photoPath = photoPath;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Getters & Setters
    public int getPersonId() { return personId; }
    public void setPersonId(int personId) { this.personId = personId; }

    public int getReporterId() { return reporterId; }
    public void setReporterId(int reporterId) { this.reporterId = reporterId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public Gender getGender() { return gender; }
    public void setGender(Gender gender) { this.gender = gender; }

    public String getLastSeenLocation() { return lastSeenLocation; }
    public void setLastSeenLocation(String lastSeenLocation) { this.lastSeenLocation = lastSeenLocation; }

    public Date getDateLastSeen() { return dateLastSeen; }
    public void setDateLastSeen(Date dateLastSeen) { this.dateLastSeen = dateLastSeen; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getContactInfo() { return contactInfo; }
    public void setContactInfo(String contactInfo) { this.contactInfo = contactInfo; }

    public String getPhotoPath() { return photoPath; }
    public void setPhotoPath(String photoPath) { this.photoPath = photoPath; }

    public PersonStatus getStatus() { return status; }
    public void setStatus(PersonStatus status) { this.status = status; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
