package com.example.demo.controller;

import com.example.demo.model.Medicine;
import com.example.demo.model.User;
import com.example.demo.service.MedicineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medicines")
@CrossOrigin(origins = "*")
public class MedicineController {

    private final MedicineService medicineService;

    public MedicineController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }

    // Get all medicines
    @GetMapping
    public ResponseEntity<List<Medicine>> getAllMedicines() {

        return ResponseEntity.ok(
                medicineService.getAllMedicines()
        );
    }

    // Get medicines for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Medicine>> getMedicinesByUser(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                medicineService.getMedicinesByUser(userId)
        );
    }

    // Get medicine by ID
    @GetMapping("/{id}")
    public ResponseEntity<Medicine> getMedicineById(
            @PathVariable Long id) {

        try {
            return ResponseEntity.ok(
                    medicineService.getMedicineById(id)
            );

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Existing add medicine
    @PostMapping
    public ResponseEntity<Medicine> addMedicine(
            @RequestBody Medicine medicine) {

        return ResponseEntity.ok(
                medicineService.addMedicine(medicine)
        );
    }

    // ==========================================
    // SAVE MEDICINE FROM PRESCRIPTION
    // ==========================================

    @PostMapping("/prescription")
    public ResponseEntity<Medicine> addPrescriptionMedicine(
            @RequestBody Map<String, Object> request) {

        String name =
                String.valueOf(
                        request.getOrDefault("name", "")
                ).trim();

        Object userValue = request.get("userId");

        if (name.isEmpty() || userValue == null) {
            return ResponseEntity.badRequest().build();
        }

        Long userId =
                Long.valueOf(
                        String.valueOf(userValue)
                );

        Medicine medicine = new Medicine();

        // Medicine name comes from OCR
        medicine.setName(name);

        // Empty initially.
        // User enters dosage later.
        medicine.setDosage("");

        // Empty initially.
        medicine.setFrequency("");

        medicine.setInstructions(
                "Imported from prescription."
        );

        User user = new User();
        user.setId(userId);

        medicine.setUser(user);

        return ResponseEntity.ok(
                medicineService.addMedicine(medicine)
        );
    }

    // ==========================================
    // UPDATE DOSAGE FROM REMINDER FORM
    // ==========================================

    @PutMapping("/{id}/reminder-details")
    public ResponseEntity<Medicine> updateReminderDetails(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {

        String dosage =
                String.valueOf(
                        request.getOrDefault("dosage", "")
                ).trim();

        if (dosage.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {

            return ResponseEntity.ok(
                    medicineService.updateReminderDosage(
                            id,
                            dosage
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity.notFound().build();
        }
    }

    // Update medicine
    @PutMapping("/{id}")
    public ResponseEntity<Medicine> updateMedicine(
            @PathVariable Long id,
            @RequestBody Medicine medicine) {

        try {

            return ResponseEntity.ok(
                    medicineService.updateMedicine(
                            id,
                            medicine
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity.notFound().build();
        }
    }

    // Delete medicine
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMedicine(
            @PathVariable Long id) {

        try {

            medicineService.deleteMedicine(id);

            return ResponseEntity.ok(
                    "Medicine deleted successfully"
            );

        } catch (RuntimeException e) {

            return ResponseEntity.notFound().build();
        }
    }
}