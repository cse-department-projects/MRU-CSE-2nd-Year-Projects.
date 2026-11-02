package com.athletehub.api.controller;

import com.athletehub.api.dto.RankingHistoryRequestDTO;
import com.athletehub.api.dto.RankingHistoryResponseDTO;
import com.athletehub.api.service.RankingHistoryService;
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
@RequestMapping("/api/v1/ranking-history")
public class RankingHistoryController {

    @Autowired
    private RankingHistoryService rankingHistoryService;

    @Autowired
    private UserRepository userRepository;

    private Integer getCurrentUserId(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email).map(User::getId).orElseThrow();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<RankingHistoryResponseDTO> recordRanking(
            @RequestBody RankingHistoryRequestDTO request,
            Authentication authentication) {
        Integer currentUserId = getCurrentUserId(authentication);
        RankingHistoryResponseDTO response = rankingHistoryService.recordRanking(request, currentUserId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/athlete/{athleteId}")
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'SUPER_ADMIN', 'COACH', 'ATHLETE')")
    public ResponseEntity<Page<RankingHistoryResponseDTO>> getRankingHistoryByAthlete(
            @PathVariable Integer athleteId,
            Pageable pageable) {
        return ResponseEntity.ok(rankingHistoryService.getRankingHistoryByAthlete(athleteId, pageable));
    }
}
