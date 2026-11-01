package com.example.Rural.management.service;

import com.example.Rural.management.model.User;
import com.example.Rural.management.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Register a new user. Validates uniqueness of username, phone, and email.
     * Returns the saved User on success.
     * Throws IllegalArgumentException on validation failures.
     */
    public User register(User user) {
        // Trim inputs
        user.setUsername(user.getUsername().trim().toLowerCase());
        user.setPhone(user.getPhone().trim());
        user.setFullName(user.getFullName().trim());

        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (userRepository.existsByPhone(user.getPhone())) {
            throw new IllegalArgumentException("Phone number already registered");
        }
        if (user.getEmail() != null && !user.getEmail().isBlank()
                && userRepository.existsByEmail(user.getEmail().trim())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // In production you'd hash the password (BCrypt). Storing plain for demo.
        return userRepository.save(user);
    }

    /**
     * Authenticate by username-or-phone + password.
     * Returns the User if credentials match, empty otherwise.
     */
    public Optional<User> login(String identifier, String password) {
        identifier = identifier.trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByUsernameOrPhone(identifier, identifier);
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            return userOpt;
        }
        return Optional.empty();
    }
}
