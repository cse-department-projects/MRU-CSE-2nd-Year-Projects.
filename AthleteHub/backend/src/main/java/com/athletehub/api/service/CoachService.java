package com.athletehub.api.service;

import com.athletehub.api.dto.CoachRequest;
import com.athletehub.api.dto.CoachResponse;
import com.athletehub.api.entity.Coach;

import java.util.Map;
import java.util.List;

public interface CoachService {
    Coach createCoach(Integer userId, CoachRequest request) throws Exception;
    
    Coach updateCoach(Integer coachId, CoachRequest request, Integer updaterId) throws Exception;
    
    Coach getCoachById(Integer id);
    
    CoachResponse searchCoaches(String search, Integer organizationId, String specialization, String status, int page, int pageSize, String sortBy, String sortDir);
    
    CoachResponse searchCoaches(String search, Integer organizationId, Integer sportId, String specialization, String status, int page, int pageSize, String sortBy, String sortDir);
    
    void softDeleteCoach(Integer id, Integer deleterId) throws Exception;
    
    Map<String, Object> getDashboardStats();
    
    List<String> validateCoachRequest(CoachRequest request);
}
