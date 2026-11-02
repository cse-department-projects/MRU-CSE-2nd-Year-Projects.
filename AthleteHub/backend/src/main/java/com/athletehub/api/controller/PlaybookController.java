package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.dto.PlayDTO;
import com.athletehub.api.dto.PlaybookDTO;
import com.athletehub.api.service.PlaybookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/playbooks")
public class PlaybookController {

    @Autowired
    private PlaybookService playbookService;

    @PostMapping
    @PreAuthorize("hasAnyRole('COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PlaybookDTO>> createPlaybook(@RequestBody PlaybookDTO dto) {
        PlaybookDTO created = playbookService.createPlaybook(dto);
        return ResponseEntity.ok(ApiResponse.success("Playbook created successfully", created));
    }

    @GetMapping("/coach/{coachId}")
    @PreAuthorize("hasAnyRole('COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<PlaybookDTO>>> getCoachPlaybooks(@PathVariable Integer coachId) {
        List<PlaybookDTO> playbooks = playbookService.getPlaybooksByCoach(coachId);
        return ResponseEntity.ok(ApiResponse.success("Playbooks retrieved", playbooks));
    }

    @PostMapping("/{playbookId}/plays")
    @PreAuthorize("hasAnyRole('COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PlayDTO>> addPlayToPlaybook(
            @PathVariable Integer playbookId,
            @RequestBody PlayDTO playDTO) {
        PlayDTO created = playbookService.addPlayToPlaybook(playbookId, playDTO);
        return ResponseEntity.ok(ApiResponse.success("Play added to playbook", created));
    }

    @PutMapping("/plays/{playId}/canvas")
    @PreAuthorize("hasAnyRole('COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PlayDTO>> updatePlayCanvas(
            @PathVariable Integer playId,
            @RequestBody PlayDTO playDTO) {
        PlayDTO updated = playbookService.updatePlayCanvas(playId, playDTO.getCanvasState());
        return ResponseEntity.ok(ApiResponse.success("Canvas updated successfully", updated));
    }
}
