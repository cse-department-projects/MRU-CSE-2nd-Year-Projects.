package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.entity.Sport;
import com.athletehub.api.repository.SportRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/sports")
public class SportController {

    private final SportRepository sportRepository;

    public SportController(SportRepository sportRepository) {
        this.sportRepository = sportRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getSports() {
        List<Sport> sports = sportRepository.findByStatus("Active");
        
        List<Map<String, Object>> data = sports.stream().map(s -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", s.getId());
            map.put("name", s.getName());
            map.put("category", s.getCategory());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Sports retrieved successfully.", data));
    }
}
