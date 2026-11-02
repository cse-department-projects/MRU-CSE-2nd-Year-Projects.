package com.athletehub.api.controller;

import com.athletehub.api.dto.PerformanceRecordRequestDTO;
import com.athletehub.api.dto.PerformanceRecordResponseDTO;
import com.athletehub.api.service.PerformanceRecordService;
import com.athletehub.api.entity.User;
import com.athletehub.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/performance-records")
public class PerformanceRecordController {

    @Autowired
    private PerformanceRecordService performanceRecordService;

    @Autowired
    private UserRepository userRepository;

    private Integer getCurrentUserId(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email).map(User::getId).orElseThrow();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'SUPER_ADMIN', 'COACH')")
    public ResponseEntity<PerformanceRecordResponseDTO> createRecord(
            @RequestBody PerformanceRecordRequestDTO request,
            Authentication authentication) {
        Integer currentUserId = getCurrentUserId(authentication);
        PerformanceRecordResponseDTO response = performanceRecordService.createRecord(request, currentUserId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/athlete/{athleteId}")
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'SUPER_ADMIN', 'COACH', 'ATHLETE')")
    public ResponseEntity<Page<PerformanceRecordResponseDTO>> getRecordsByAthlete(
            @PathVariable Integer athleteId,
            Pageable pageable) {
        return ResponseEntity.ok(performanceRecordService.getRecordsByAthlete(athleteId, pageable));
    }
}
