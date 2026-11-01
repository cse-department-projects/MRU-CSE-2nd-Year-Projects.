package com.example.Rural.management.controller;

import com.example.Rural.management.model.User;
import com.example.Rural.management.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/auth/register
     * Body: { fullName, username, phone, email?, password, role, village?, ward? }
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user) {
        try {
            User saved = authService.register(user);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Account created successfully!",
                "userId", saved.getId(),
                "username", saved.getUsername(),
                "role", saved.getRole()
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", ex.getMessage()
            ));
        }
    }

    /**
     * POST /api/auth/login
     * Body: { identifier, password, role }
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String identifier = body.getOrDefault("identifier", "");
        String password = body.getOrDefault("password", "");
        String role = body.getOrDefault("role", "");

        if (identifier.isBlank() || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Username/phone and password are required"
            ));
        }

        Optional<User> userOpt = authService.login(identifier, password);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "Invalid username/phone or password"
            ));
        }

        User user = userOpt.get();

        // Optionally validate role matches
        if (!role.isBlank() && !user.getRole().equalsIgnoreCase(role)) {
            return ResponseEntity.status(403).body(Map.of(
                "success", false,
                "message", "You are not registered as " + role + ". Your role is " + user.getRole() + "."
            ));
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Login successful!",
            "userId", user.getId(),
            "fullName", user.getFullName(),
            "username", user.getUsername(),
            "role", user.getRole()
        ));
    }
}
