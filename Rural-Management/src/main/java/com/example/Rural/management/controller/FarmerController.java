package com.example.Rural.management.controller;

import com.example.Rural.management.model.Farmer;
import com.example.Rural.management.service.FarmerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farmers")
@CrossOrigin(origins = "*")
public class FarmerController {

    private final FarmerService farmerService;

    public FarmerController(FarmerService farmerService) {
        this.farmerService = farmerService;
    }

    @GetMapping
    public List<Farmer> getAllFarmers() {
        return farmerService.getAllFarmers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Farmer> getFarmerById(@PathVariable Long id) {
        return ResponseEntity.ok(farmerService.getFarmerById(id));
    }

    @GetMapping("/ward/{ward}")
    public List<Farmer> getFarmersByWard(@PathVariable String ward) {
        return farmerService.getFarmersByWard(ward);
    }

    @GetMapping("/crop/{crop}")
    public List<Farmer> getFarmersByCrop(@PathVariable String crop) {
        return farmerService.getFarmersByCrop(crop);
    }

    @PostMapping
    public ResponseEntity<Farmer> createFarmer(@Valid @RequestBody Farmer farmer) {
        Farmer created = farmerService.createFarmer(farmer);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Farmer> updateFarmer(@PathVariable Long id,
                                                @Valid @RequestBody Farmer farmer) {
        return ResponseEntity.ok(farmerService.updateFarmer(id, farmer));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFarmer(@PathVariable Long id) {
        farmerService.deleteFarmer(id);
        return ResponseEntity.noContent().build();
    }
}
