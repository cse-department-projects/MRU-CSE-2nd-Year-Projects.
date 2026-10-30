package com.example.demo.controller;

import com.example.demo.model.Patient;
import com.example.demo.service.PatientService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    private final PatientService patientService;

    public PatientController(
            PatientService patientService) {

        this.patientService = patientService;
    }


    // Get all patients

    @GetMapping
    public ResponseEntity<List<Patient>>
    getAllPatients() {

        return ResponseEntity.ok(
                patientService.getAllPatients()
        );
    }


    // Get patient by ID

    @GetMapping("/{id}")
    public ResponseEntity<Patient>
    getPatientById(
            @PathVariable Long id) {

        try {

            return ResponseEntity.ok(
                    patientService.getPatientById(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }


    // Get patient by user ID

    @GetMapping("/user/{userId}")
    public ResponseEntity<Patient>
    getPatientByUserId(
            @PathVariable Long userId) {

        return patientService
                .getPatientByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }


    // Create patient

    @PostMapping("/user/{userId}")
    public ResponseEntity<Patient>
    createPatient(
            @PathVariable Long userId,
            @RequestBody Patient patient) {

        return ResponseEntity.ok(
                patientService.createPatient(
                        userId,
                        patient
                )
        );
    }


    // Update patient

    @PutMapping("/{id}")
    public ResponseEntity<Patient>
    updatePatient(
            @PathVariable Long id,
            @RequestBody Patient patient) {

        return ResponseEntity.ok(
                patientService.updatePatient(
                        id,
                        patient
                )
        );
    }


    // Delete patient

    @DeleteMapping("/{id}")
    public ResponseEntity<String>
    deletePatient(
            @PathVariable Long id) {

        patientService.deletePatient(id);

        return ResponseEntity.ok(
                "Patient deleted successfully"
        );
    }
}