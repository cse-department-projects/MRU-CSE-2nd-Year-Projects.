package com.athletehub.api.controller;

import com.athletehub.api.dto.CoachEvaluationRequestDTO;
import com.athletehub.api.dto.CoachEvaluationResponseDTO;
import com.athletehub.api.service.CoachEvaluationService;
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
@RequestMapping("/api/v1/coach-evaluations")
public class CoachEvaluationController {

    @Autowired
    private CoachEvaluationService coachEvaluationService;

    @Autowired
    private UserRepository userRepository;

    private Integer getCurrentUserId(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email).map(User::getId).orElseThrow();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<CoachEvaluationResponseDTO> createEvaluation(
            @RequestBody CoachEvaluationRequestDTO request,
            Authentication authentication) {
        Integer currentUserId = getCurrentUserId(authentication);
        CoachEvaluationResponseDTO response = coachEvaluationService.createEvaluation(request, currentUserId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/coach/{coachId}")
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'SUPER_ADMIN', 'COACH')")
    public ResponseEntity<Page<CoachEvaluationResponseDTO>> getEvaluationsByCoach(
            @PathVariable Integer coachId,
            Pageable pageable) {
        return ResponseEntity.ok(coachEvaluationService.getEvaluationsByCoach(coachId, pageable));
    }
}
