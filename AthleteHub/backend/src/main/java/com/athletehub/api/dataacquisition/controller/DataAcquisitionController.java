package com.athletehub.api.dataacquisition.controller;

import com.athletehub.api.dataacquisition.dto.ImportPreviewResponse;
import com.athletehub.api.dataacquisition.parser.CsvDatasetParser;
import com.athletehub.api.dataacquisition.service.DatasetImportService;
import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.entity.ImportJob;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@RestController
@RequestMapping("/api/v1/data-acquisition")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ORG_ADMIN')")
public class DataAcquisitionController {

    private final DatasetImportService importService;

    public DataAcquisitionController(DatasetImportService importService) {
        this.importService = importService;
    }

    @PostMapping("/preview")
    public ResponseEntity<Object> previewImport(
            @RequestParam("file") MultipartFile file,
            @RequestParam("profile") String profile) {
        try {
            validateCsvFile(file);
            try (CsvDatasetParser parser = new CsvDatasetParser()) {
                parser.initialize(file.getInputStream());
                ImportPreviewResponse response = importService.previewImport(parser, profile, 100);
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            java.util.Map<String, String> errorResp = new java.util.HashMap<>();
            errorResp.put("message", e.getMessage() != null ? e.getMessage() : "Unable to preview the import file.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResp);
        }
    }

    @PostMapping("/import")
    public ResponseEntity<?> executeImport(
            @RequestParam("file") MultipartFile file,
            @RequestParam("profile") String profile,
            @RequestParam(value = "targetOrganizationId", required = false) Integer targetOrganizationId) {
        try {
            validateCsvFile(file);
            try (CsvDatasetParser parser = new CsvDatasetParser()) {
                parser.initialize(file.getInputStream());
                ImportJob job = importService.executeImport(parser, profile, file.getOriginalFilename(), targetOrganizationId);
                return ResponseEntity.ok(job);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(java.util.Map.of("message", e.getMessage() != null ? e.getMessage() : "Import failed"));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<java.util.List<ImportJob>> getImportHistory() {
        return ResponseEntity.ok(importService.getImportHistory());
    }

    @GetMapping("/pool-filters")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> getPoolFilters() {
        try {
            return ResponseEntity.ok(ApiResponse.success("Pool filters retrieved successfully.", importService.getPoolFilterOptions()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage() != null ? e.getMessage() : "Failed to load pool filters"));
        }
    }

    @GetMapping("/unassigned-athletes")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> getUnassignedAthletes(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "sportId", required = false) Integer sportId,
            @RequestParam(value = "country", required = false) String country,
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "pageSize", defaultValue = "20") int pageSize) {
        try {
            return ResponseEntity.ok(ApiResponse.success("Unassigned athletes retrieved successfully.", importService.getUnassignedAthletes(search, sportId, country, gender, page, pageSize)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage() != null ? e.getMessage() : "Failed to load unassigned athletes"));
        }
    }

    @PostMapping("/allocate")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> allocateAthletes(@RequestBody java.util.Map<String, Object> body) {
        try {
            Object targetOrgObj = body.get("targetOrganizationId");
            if (targetOrgObj == null) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "targetOrganizationId is required"));
            }
            Integer targetOrgId = Integer.valueOf(targetOrgObj.toString());
            Integer count = body.containsKey("count") && body.get("count") != null ? Integer.valueOf(body.get("count").toString()) : null;
            
            java.util.List<Integer> specificIds = null;
            if (body.containsKey("athleteIds") && body.get("athleteIds") instanceof java.util.List) {
                java.util.List<?> rawList = (java.util.List<?>) body.get("athleteIds");
                specificIds = rawList.stream().map(o -> Integer.valueOf(o.toString())).collect(java.util.stream.Collectors.toList());
            }

            Integer sportId = body.containsKey("sportId") && body.get("sportId") != null && !body.get("sportId").toString().isEmpty()
                    ? Integer.valueOf(body.get("sportId").toString())
                    : null;
            String country = body.containsKey("country") && body.get("country") != null ? body.get("country").toString() : null;
            String gender = body.containsKey("gender") && body.get("gender") != null ? body.get("gender").toString() : null;

            int assigned = importService.allocateAthletesToOrganization(targetOrgId, count, specificIds, sportId, country, gender);
            return ResponseEntity.ok(java.util.Map.of(
                "status", "success",
                "message", "Successfully allocated " + assigned + " athletes to target organization.",
                "allocatedCount", assigned,
                "targetOrganizationId", targetOrgId
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage() != null ? e.getMessage() : "Allocation failed"));
        }
    }

    private void validateCsvFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Choose a non-empty CSV file.");
        }
        String name = file.getOriginalFilename();
        if (name == null || !name.toLowerCase(java.util.Locale.ROOT).endsWith(".csv")) {
            throw new IllegalArgumentException("Only CSV files are currently supported.");
        }
    }
}
