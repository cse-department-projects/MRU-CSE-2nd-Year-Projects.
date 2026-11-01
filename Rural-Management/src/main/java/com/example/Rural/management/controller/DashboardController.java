package com.example.Rural.management.controller;

import com.example.Rural.management.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final FarmerService farmerService;
    private final CropService cropService;
    private final SchemeService schemeService;
    private final ShgService shgService;

    public DashboardController(FarmerService farmerService,
                                CropService cropService,
                                SchemeService schemeService,
                                ShgService shgService) {
        this.farmerService = farmerService;
        this.cropService = cropService;
        this.schemeService = schemeService;
        this.shgService = shgService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalFarmers", farmerService.getFarmerCount());
        stats.put("totalCrops", cropService.getCropCount());
        stats.put("totalSchemes", schemeService.getSchemeCount());
        stats.put("totalShgGroups", shgService.getGroupCount());
        return ResponseEntity.ok(stats);
    }
}
