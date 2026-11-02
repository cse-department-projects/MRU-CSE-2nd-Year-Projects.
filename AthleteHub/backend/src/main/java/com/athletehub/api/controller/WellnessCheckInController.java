package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.dto.WellnessCheckInDTO;
import com.athletehub.api.service.WellnessCheckInService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/wellness")
public class WellnessCheckInController {

    @Autowired
    private WellnessCheckInService wellnessService;

    @PostMapping("/athletes/{athleteId}")
    @PreAuthorize("hasAnyRole('ATHLETE', 'COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<WellnessCheckInDTO>> saveCheckIn(
            @PathVariable Integer athleteId,
            @RequestBody WellnessCheckInDTO dto) {
        WellnessCheckInDTO saved = wellnessService.saveCheckIn(athleteId, dto);
        return ResponseEntity.ok(ApiResponse.success("Check-in saved successfully", saved));
    }

    @GetMapping("/athletes/{athleteId}/date/{date}")
    @PreAuthorize("hasAnyRole('ATHLETE', 'COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<WellnessCheckInDTO>> getCheckInByDate(
            @PathVariable Integer athleteId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        WellnessCheckInDTO checkIn = wellnessService.getCheckInByDate(athleteId, date);
        return ResponseEntity.ok(ApiResponse.success("Check-in retrieved", checkIn));
    }

    @GetMapping("/athletes/{athleteId}")
    @PreAuthorize("hasAnyRole('ATHLETE', 'COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<WellnessCheckInDTO>>> getCheckIns(
            @PathVariable Integer athleteId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<WellnessCheckInDTO> checkIns = wellnessService.getAthleteCheckIns(athleteId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Check-ins retrieved", checkIns));
    }

    @GetMapping("/athletes/{athleteId}/acwr")
    @PreAuthorize("hasAnyRole('ATHLETE', 'COACH', 'ORG_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<WellnessCheckInDTO>> getAthleteACWR(
            @PathVariable Integer athleteId) {
        WellnessCheckInDTO stats = wellnessService.calculateACWR(athleteId);
        return ResponseEntity.ok(ApiResponse.success("ACWR calculated successfully", stats));
    }
}
