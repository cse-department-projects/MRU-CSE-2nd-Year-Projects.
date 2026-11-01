package com.example.Rural.management.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Full name is required")
    @Column(nullable = false)
    private String fullName;

    @NotBlank(message = "Username is required")
    @Column(nullable = false, unique = true)
    private String username;

    @NotBlank(message = "Phone is required")
    @Column(nullable = false, unique = true)
    private String phone;

    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @Column(nullable = false)
    private String password;

    @NotBlank(message = "Role is required")
    @Column(nullable = false)
    private String role; // Admin, Citizen, Farmer

    private String village;

    private String ward;

    public User() {}

    public User(String fullName, String username, String phone, String email,
                String password, String role, String village, String ward) {
        this.fullName = fullName;
        this.username = username;
        this.phone = phone;
        this.email = email;
        this.password = password;
        this.role = role;
        this.village = village;
        this.ward = ward;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getVillage() { return village; }
    public void setVillage(String village) { this.village = village; }

    public String getWard() { return ward; }
    public void setWard(String ward) { this.ward = ward; }
}
