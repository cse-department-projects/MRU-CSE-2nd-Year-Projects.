package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.dto.DashboardStatsDTO;
import com.athletehub.api.entity.User;
import com.athletehub.api.repository.UserRepository;
import com.athletehub.api.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    public DashboardController(DashboardService dashboardService, UserRepository userRepository) {
        this.dashboardService = dashboardService;
        this.userRepository = userRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        User user = userOpt.orElse(null);

        String roleName = "UNKNOWN";
        if (user != null && user.getRole() != null) {
            roleName = user.getRole().getName();
        }

        DashboardStatsDTO stats = dashboardService.getDashboardStats(user, roleName);
        return ResponseEntity.ok(ApiResponse.success("Dashboard data retrieved successfully.", stats));
    }
}
