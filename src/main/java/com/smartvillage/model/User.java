package com.smartvillage.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(length = 100)
    private String email;

    @Column(length = 15)
    private String phone;

    @Column(nullable = false, length = 20)
    private String role; // 'CITIZEN' or 'ADMIN'

    @Column(length = 16)
    private String aadhaar;

    @Column(length = 20)
    private String rationCard;

    @Column(length = 10)
    private String wardNumber;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 50)
    private String occupation;

    private Integer householdMembers = 1;

    @Column(length = 20)
    private String status = "ACTIVE";

    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {}

    public User(String username, String password, String fullName, String role, String email, String phone, String wardNumber) {
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.role = role;
        this.email = email;
        this.phone = phone;
        this.wardNumber = wardNumber;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAadhaar() { return aadhaar; }
    public void setAadhaar(String aadhaar) { this.aadhaar = aadhaar; }

    public String getRationCard() { return rationCard; }
    public void setRationCard(String rationCard) { this.rationCard = rationCard; }

    public String getWardNumber() { return wardNumber; }
    public void setWardNumber(String wardNumber) { this.wardNumber = wardNumber; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getOccupation() { return occupation; }
    public void setOccupation(String occupation) { this.occupation = occupation; }

    public Integer getHouseholdMembers() { return householdMembers; }
    public void setHouseholdMembers(Integer householdMembers) { this.householdMembers = householdMembers; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
