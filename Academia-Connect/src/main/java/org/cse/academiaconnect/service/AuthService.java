package org.cse.academiaconnect.service;

import org.cse.academiaconnect.dto.RegisterRequest;
import org.cse.academiaconnect.entity.User;
import org.cse.academiaconnect.entity.User.UserRole;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserService userService,
                       PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    public void register(RegisterRequest request) {

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match.");
        }

        User user = new User();

        user.setFullName(request.getFullName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setDepartment(request.getDepartment());

        user.setRole(UserRole.valueOf(request.getRole()));

        user.setPassword(passwordEncoder.encode(request.getPassword()));

        userService.createUser(user);
    }
}