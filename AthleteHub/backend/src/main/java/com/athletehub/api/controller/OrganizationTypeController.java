package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.entity.OrganizationType;
import com.athletehub.api.repository.OrganizationTypeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/organization-types")
public class OrganizationTypeController {

    private final OrganizationTypeRepository organizationTypeRepository;

    public OrganizationTypeController(OrganizationTypeRepository organizationTypeRepository) {
        this.organizationTypeRepository = organizationTypeRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getOrganizationTypes() {
        List<OrganizationType> types = organizationTypeRepository.findByStatus("Active");
        
        List<Map<String, Object>> data = types.stream().map(t -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", t.getId());
            map.put("name", t.getName());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Organization types retrieved successfully.", data));
    }
}
