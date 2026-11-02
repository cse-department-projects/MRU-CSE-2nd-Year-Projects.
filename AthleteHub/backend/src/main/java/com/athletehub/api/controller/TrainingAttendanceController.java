package com.athletehub.api.controller;

import com.athletehub.api.dto.ApiResponse;
import com.athletehub.api.dto.TrainingAttendanceDTO;
import com.athletehub.api.dto.TrainingAttendanceRequest;
import com.athletehub.api.service.TrainingAttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/training-attendance")
public class TrainingAttendanceController {

    @Autowired
    private TrainingAttendanceService trainingAttendanceService;

    @PostMapping
    @PreAuthorize("hasAnyRole('COACH', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TrainingAttendanceDTO>> recordAttendance(@RequestBody TrainingAttendanceRequest request) {
        TrainingAttendanceDTO recorded = trainingAttendanceService.recordAttendance(request);
        return ResponseEntity.ok(ApiResponse.success("Attendance recorded successfully", recorded));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('COACH', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TrainingAttendanceDTO>> updateAttendance(@PathVariable Integer id, @RequestBody TrainingAttendanceRequest request) {
        TrainingAttendanceDTO updated = trainingAttendanceService.updateAttendance(id, request);
        return ResponseEntity.ok(ApiResponse.success("Attendance updated successfully", updated));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TrainingAttendanceDTO>> getAttendanceById(@PathVariable Integer id) {
        TrainingAttendanceDTO attendance = trainingAttendanceService.getAttendanceById(id);
        return ResponseEntity.ok(ApiResponse.success("Attendance retrieved successfully", attendance));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<ApiResponse<Page<TrainingAttendanceDTO>>> getAttendanceBySessionId(@PathVariable Integer sessionId, Pageable pageable) {
        Page<TrainingAttendanceDTO> attendance = trainingAttendanceService.getAttendanceBySessionId(sessionId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Attendance retrieved successfully", attendance));
    }

    @GetMapping("/athlete/{athleteId}")
    public ResponseEntity<ApiResponse<Page<TrainingAttendanceDTO>>> getAttendanceByAthleteId(@PathVariable Integer athleteId, Pageable pageable) {
        Page<TrainingAttendanceDTO> attendance = trainingAttendanceService.getAttendanceByAthleteId(athleteId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Attendance retrieved successfully", attendance));
    }

    @GetMapping("/sessions-overview")
    public ResponseEntity<ApiResponse<Page<com.athletehub.api.dto.SessionAttendanceSummaryDTO>>> getSessionsAttendanceOverview(
            @RequestParam(required = false) Integer teamId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate startDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(name = "page_size", required = false) Integer pageSize) {
        int effectivePage = page > 0 ? page - 1 : 0;
        int effectiveSize = pageSize != null ? pageSize : size;
        Pageable pageable = org.springframework.data.domain.PageRequest.of(
                effectivePage, effectiveSize, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "sessionDate", "startTime")
        );
        Page<com.athletehub.api.dto.SessionAttendanceSummaryDTO> overview =
                trainingAttendanceService.getSessionsAttendanceOverview(teamId, status, startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.success("Sessions attendance overview retrieved successfully", overview));
    }
}
