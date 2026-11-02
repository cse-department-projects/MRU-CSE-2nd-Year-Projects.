package com.athletehub.api.service;

import com.athletehub.api.dto.PlayDTO;
import com.athletehub.api.dto.PlaybookDTO;
import com.athletehub.api.entity.Coach;
import com.athletehub.api.entity.Play;
import com.athletehub.api.entity.Playbook;
import com.athletehub.api.exception.ResourceNotFoundException;
import com.athletehub.api.repository.CoachRepository;
import com.athletehub.api.repository.PlayRepository;
import com.athletehub.api.repository.PlaybookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlaybookService {

    @Autowired
    private PlaybookRepository playbookRepository;

    @Autowired
    private PlayRepository playRepository;

    @Autowired
    private CoachRepository coachRepository;

    @Autowired
    private com.athletehub.api.security.TenantSecurityService tenantSecurityService;

    @Transactional
    public PlaybookDTO createPlaybook(PlaybookDTO dto) {
        Coach coach = coachRepository.findById(dto.getCoachId())
                .orElseThrow(() -> new ResourceNotFoundException("Coach not found with id: " + dto.getCoachId()));
        tenantSecurityService.validateCoachInCurrentOrg(coach);

        Playbook playbook = new Playbook();
        playbook.setTitle(dto.getTitle());
        playbook.setDescription(dto.getDescription());
        playbook.setCoach(coach);

        Playbook saved = playbookRepository.save(playbook);
        return mapToDTO(saved);
    }

    public List<PlaybookDTO> getPlaybooksByCoach(Integer coachId) {
        Coach coach = coachRepository.findById(coachId)
                .orElseThrow(() -> new ResourceNotFoundException("Coach not found with id: " + coachId));
        tenantSecurityService.validateCoachInCurrentOrg(coach);

        return playbookRepository.findByCoachId(coachId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PlayDTO addPlayToPlaybook(Integer playbookId, PlayDTO playDTO) {
        Playbook playbook = playbookRepository.findById(playbookId)
                .orElseThrow(() -> new ResourceNotFoundException("Playbook not found with id: " + playbookId));
        tenantSecurityService.validateCoachInCurrentOrg(playbook.getCoach());

        Play play = new Play();
        play.setPlaybook(playbook);
        play.setTitle(playDTO.getTitle());
        play.setDescription(playDTO.getDescription());
        play.setCanvasState(playDTO.getCanvasState());

        Play saved = playRepository.save(play);
        return mapToPlayDTO(saved);
    }
    
    @Transactional
    public PlayDTO updatePlayCanvas(Integer playId, String canvasState) {
        Play play = playRepository.findById(playId)
                .orElseThrow(() -> new ResourceNotFoundException("Play not found with id: " + playId));
        tenantSecurityService.validateCoachInCurrentOrg(play.getPlaybook().getCoach());
        play.setCanvasState(canvasState);
        Play saved = playRepository.save(play);
        return mapToPlayDTO(saved);
    }

    private PlaybookDTO mapToDTO(Playbook entity) {
        PlaybookDTO dto = new PlaybookDTO();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setCoachId(entity.getCoach().getId());
        dto.setCreatedAt(entity.getCreatedAt());
        
        if (entity.getPlays() != null) {
            dto.setPlays(entity.getPlays().stream().map(this::mapToPlayDTO).collect(Collectors.toList()));
        }
        return dto;
    }

    private PlayDTO mapToPlayDTO(Play entity) {
        PlayDTO dto = new PlayDTO();
        dto.setId(entity.getId());
        dto.setPlaybookId(entity.getPlaybook().getId());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setCanvasState(entity.getCanvasState());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
