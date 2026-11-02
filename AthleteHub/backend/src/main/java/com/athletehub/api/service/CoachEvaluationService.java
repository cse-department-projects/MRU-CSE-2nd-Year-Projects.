package com.athletehub.api.service;

import com.athletehub.api.dto.CoachEvaluationRequestDTO;
import com.athletehub.api.dto.CoachEvaluationResponseDTO;
import com.athletehub.api.entity.Coach;
import com.athletehub.api.entity.CoachEvaluation;
import com.athletehub.api.entity.User;
import com.athletehub.api.exception.ResourceNotFoundException;
import com.athletehub.api.repository.CoachEvaluationRepository;
import com.athletehub.api.repository.CoachRepository;
import com.athletehub.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class CoachEvaluationService {

    @Autowired
    private CoachEvaluationRepository evaluationRepository;

    @Autowired
    private CoachRepository coachRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.athletehub.api.security.TenantSecurityService tenantSecurityService;

    @Transactional
    public CoachEvaluationResponseDTO createEvaluation(CoachEvaluationRequestDTO request, Integer currentUserId) {
        CoachEvaluation evaluation = new CoachEvaluation();
        
        Coach coach = coachRepository.findById(request.getCoachId())
                .orElseThrow(() -> new ResourceNotFoundException("Coach not found"));
        tenantSecurityService.validateCoachInCurrentOrg(coach);
                
        User evaluator = userRepository.findById(request.getEvaluatorId())
                .orElseThrow(() -> new ResourceNotFoundException("Evaluator not found"));
                
        evaluation.setEvaluationCode("CE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        evaluation.setCoach(coach);
        evaluation.setEvaluator(evaluator);
        evaluation.setEvaluationDate(request.getEvaluationDate());
        evaluation.setScore(request.getScore());
        evaluation.setCriteriaSummary(request.getCriteriaSummary());
        evaluation.setComments(request.getComments());
        
        evaluation.setCreatedBy(currentUserId);
        evaluation.setUpdatedBy(currentUserId);

        evaluation = evaluationRepository.save(evaluation);
        return mapToDTO(evaluation);
    }

    public Page<CoachEvaluationResponseDTO> getEvaluationsByCoach(Integer coachId, Pageable pageable) {
        Coach coach = coachRepository.findById(coachId)
                .orElseThrow(() -> new ResourceNotFoundException("Coach not found"));
        tenantSecurityService.validateCoachInCurrentOrg(coach);
        return evaluationRepository.findByCoachIdAndIsDeletedFalse(coachId, pageable)
                .map(this::mapToDTO);
    }

    private CoachEvaluationResponseDTO mapToDTO(CoachEvaluation evaluation) {
        CoachEvaluationResponseDTO dto = new CoachEvaluationResponseDTO();
        dto.setId(evaluation.getId());
        dto.setEvaluationCode(evaluation.getEvaluationCode());
        dto.setCoachId(evaluation.getCoach().getId());
        dto.setCoachName(evaluation.getCoach().getFirstName() + " " + evaluation.getCoach().getLastName());
        dto.setEvaluatorId(evaluation.getEvaluator().getId());
        dto.setEvaluatorName(evaluation.getEvaluator().getFullName());
        dto.setEvaluationDate(evaluation.getEvaluationDate());
        dto.setScore(evaluation.getScore());
        dto.setCriteriaSummary(evaluation.getCriteriaSummary());
        dto.setComments(evaluation.getComments());
        return dto;
    }
}
