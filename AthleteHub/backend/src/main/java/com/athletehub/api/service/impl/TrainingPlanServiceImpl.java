package com.athletehub.api.service.impl;

import com.athletehub.api.dto.TrainingPlanDTO;
import com.athletehub.api.dto.TrainingPlanMapper;
import com.athletehub.api.dto.TrainingPlanRequest;
import com.athletehub.api.entity.Coach;
import com.athletehub.api.entity.Organization;
import com.athletehub.api.entity.Sport;
import com.athletehub.api.entity.TrainingPlan;
import com.athletehub.api.entity.enums.DifficultyLevel;
import com.athletehub.api.entity.enums.TrainingPlanStatus;
import com.athletehub.api.exception.ResourceNotFoundException;
import com.athletehub.api.repository.CoachRepository;
import com.athletehub.api.repository.OrganizationRepository;
import com.athletehub.api.repository.SportRepository;
import com.athletehub.api.repository.TrainingPlanRepository;
import com.athletehub.api.service.TrainingPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

@Service
public class TrainingPlanServiceImpl implements TrainingPlanService {

    @Autowired
    private TrainingPlanRepository trainingPlanRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private SportRepository sportRepository;

    @Autowired
    private CoachRepository coachRepository;

    @Autowired
    private TrainingPlanMapper trainingPlanMapper;

    @Override
    @Transactional
    public TrainingPlanDTO createTrainingPlan(TrainingPlanRequest request) {
        if (request.getDurationWeeks() == null || request.getDurationWeeks() <= 0) {
            throw new IllegalArgumentException("Plan duration must be positive");
        }

        Organization org = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        
        Sport sport = sportRepository.findById(request.getSportId())
                .orElseThrow(() -> new ResourceNotFoundException("Sport not found"));
                
        Coach coach = coachRepository.findById(request.getCreatedBy())
                .orElseThrow(() -> new ResourceNotFoundException("Coach not found"));

        TrainingPlan plan = new TrainingPlan();
        plan.setTitle(request.getTitle());
        plan.setDescription(request.getDescription());
        plan.setOrganization(org);
        plan.setSport(sport);
        plan.setCreatedBy(coach);
        plan.setDifficultyLevel(DifficultyLevel.valueOf(request.getDifficultyLevel().toUpperCase()));
        plan.setDurationWeeks(request.getDurationWeeks());
        
        if (request.getStatus() != null) {
            plan.setStatus(TrainingPlanStatus.valueOf(request.getStatus().toUpperCase()));
        }

        // Save to get ID
        TrainingPlan savedPlan = trainingPlanRepository.save(plan);
        
        // Generate plan code
        savedPlan.setPlanCode("TPL" + String.format("%06d", savedPlan.getId()));
        
        // Save again with code
        savedPlan = trainingPlanRepository.save(savedPlan);
        
        return trainingPlanMapper.toDTO(savedPlan);
    }

    @Override
    @Transactional
    public TrainingPlanDTO updateTrainingPlan(Integer id, TrainingPlanRequest request) {
        TrainingPlan plan = trainingPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Training Plan not found"));
                
        if (plan.getStatus() == TrainingPlanStatus.ARCHIVED) {
            throw new IllegalArgumentException("Archived plans cannot be edited");
        }
        
        if (plan.getStatus() == TrainingPlanStatus.COMPLETED && request.getStatus() != null && !request.getStatus().equals("COMPLETED")) {
             throw new IllegalArgumentException("Completed plans become read-only and cannot have status changed to active");
        }

        if (request.getDurationWeeks() != null && request.getDurationWeeks() <= 0) {
            throw new IllegalArgumentException("Plan duration must be positive");
        }

        if (request.getTitle() != null) plan.setTitle(request.getTitle());
        if (request.getDescription() != null) plan.setDescription(request.getDescription());
        if (request.getDifficultyLevel() != null) plan.setDifficultyLevel(DifficultyLevel.valueOf(request.getDifficultyLevel().toUpperCase()));
        if (request.getDurationWeeks() != null) plan.setDurationWeeks(request.getDurationWeeks());
        if (request.getStatus() != null) plan.setStatus(TrainingPlanStatus.valueOf(request.getStatus().toUpperCase()));

        TrainingPlan updatedPlan = trainingPlanRepository.save(plan);
        return trainingPlanMapper.toDTO(updatedPlan);
    }

    @Override
    public TrainingPlanDTO getTrainingPlanById(Integer id) {
        TrainingPlan plan = trainingPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Training Plan not found"));
        return trainingPlanMapper.toDTO(plan);
    }

    @Override
    @Transactional
    public void deleteTrainingPlan(Integer id) {
        TrainingPlan plan = trainingPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Training Plan not found"));
        plan.setStatus(TrainingPlanStatus.ARCHIVED);
        trainingPlanRepository.save(plan);
    }

    @Override
    public Page<TrainingPlanDTO> searchTrainingPlans(String search, Integer organizationId, Integer coachId, Integer sportId, String status, String difficultyLevel, Pageable pageable) {
        Specification<TrainingPlan> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (search != null && !search.isEmpty()) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                Predicate titlePredicate = cb.like(cb.lower(root.get("title")), searchPattern);
                Predicate codePredicate = cb.like(cb.lower(root.get("planCode")), searchPattern);
                predicates.add(cb.or(titlePredicate, codePredicate));
            }
            
            if (organizationId != null) {
                predicates.add(cb.equal(root.get("organization").get("id"), organizationId));
            }
            
            if (coachId != null) {
                predicates.add(cb.equal(root.get("createdBy").get("id"), coachId));
            }
            
            if (sportId != null) {
                predicates.add(cb.equal(root.get("sport").get("id"), sportId));
            }
            
            if (status != null && !status.isEmpty()) {
                predicates.add(cb.equal(root.get("status"), TrainingPlanStatus.valueOf(status.toUpperCase())));
            }
            
            if (difficultyLevel != null && !difficultyLevel.isEmpty()) {
                predicates.add(cb.equal(root.get("difficultyLevel"), DifficultyLevel.valueOf(difficultyLevel.toUpperCase())));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        
        return trainingPlanRepository.findAll(spec, pageable).map(trainingPlanMapper::toDTO);
    }
}
