package com.athletehub.api.service;

import com.athletehub.api.dto.CoachAssignmentRequest;
import com.athletehub.api.dto.CoachAssignmentResponse;
import com.athletehub.api.entity.CoachAssignment;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface CoachAssignmentService {
    CoachAssignment createAssignment(Integer userId, CoachAssignmentRequest request) throws Exception;
    
    CoachAssignment updateAssignment(Integer id, CoachAssignmentRequest request, Integer updaterId, boolean isSuperAdmin) throws Exception;
    
    CoachAssignment getAssignmentById(Integer id);
    
    CoachAssignmentResponse searchAssignments(String search, Integer organizationId, Integer coachId, Integer athleteId, String status, LocalDate startDate, LocalDate endDate, int page, int pageSize, String sortBy, String sortDir);
    
    void deleteAssignment(Integer id, Integer deleterId) throws Exception;
    
    Map<String, Object> getDashboardStats();
    
    List<String> validateAssignmentRequest(CoachAssignmentRequest request);
    
    List<CoachAssignment> getAssignmentsByCoach(Integer coachId);
    
    List<CoachAssignment> getAssignmentsByAthlete(Integer athleteId);
}
