package com.example.demo.controller;

import com.example.demo.service.PrescriptionOcrService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prescription")
@CrossOrigin(origins = "*")
public class PrescriptionController {

    @Autowired
    private PrescriptionOcrService prescriptionOcrService;


    @PostMapping(
        value = "/ocr",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> readPrescription(
            @RequestParam("file") MultipartFile file) {

        try {

            if (file == null || file.isEmpty()) {

                Map<String, Object> error =
                        new HashMap<>();

                error.put("success", false);
                error.put(
                    "message",
                    "Please upload a prescription image."
                );

                return ResponseEntity
                        .badRequest()
                        .body(error);
            }


            List<String> medicines =
                    prescriptionOcrService
                            .extractMedicineNames(file);


            Map<String, Object> response =
                    new HashMap<>();

            response.put("success", true);
            response.put("medicines", medicines);


            return ResponseEntity.ok(response);

        }

        catch (Exception e) {

            e.printStackTrace();

            Map<String, Object> error =
                    new HashMap<>();

            error.put("success", false);
            error.put(
                "message",
                "OCR failed: " + e.getMessage()
            );

            return ResponseEntity
                    .internalServerError()
                    .body(error);
        }
    }
}
