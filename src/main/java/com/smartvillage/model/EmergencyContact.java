package com.smartvillage.model;

import jakarta.persistence.*;

@Entity
@Table(name = "emergency_contacts")
public class EmergencyContact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String category; // PANCHAYAT, POLICE, HEALTHCARE, ELECTRICITY, WATER_BOARD

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 100)
    private String designation;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(length = 20)
    private String altPhone;

    @Column(length = 100)
    private String email;

    @Column(length = 100)
    private String location;

    public EmergencyContact() {}

    public EmergencyContact(String category, String name, String designation, String phone, String altPhone, String email, String location) {
        this.category = category;
        this.name = name;
        this.designation = designation;
        this.phone = phone;
        this.altPhone = altPhone;
        this.email = email;
        this.location = location;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAltPhone() { return altPhone; }
    public void setAltPhone(String altPhone) { this.altPhone = altPhone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
}
