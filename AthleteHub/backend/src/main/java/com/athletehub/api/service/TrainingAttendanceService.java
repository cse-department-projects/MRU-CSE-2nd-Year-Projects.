package com.athletehub.api.service;

import com.athletehub.api.dto.TrainingAttendanceDTO;
import com.athletehub.api.dto.TrainingAttendanceRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TrainingAttendanceService {
    TrainingAttendanceDTO recordAttendance(TrainingAttendanceRequest request);
    TrainingAttendanceDTO updateAttendance(Integer id, TrainingAttendanceRequest request);
    TrainingAttendanceDTO getAttendanceById(Integer id);
    Page<TrainingAttendanceDTO> getAttendanceBySessionId(Integer sessionId, Pageable pageable);
    Page<TrainingAttendanceDTO> getAttendanceByAthleteId(Integer athleteId, Pageable pageable);
    Page<com.athletehub.api.dto.SessionAttendanceSummaryDTO> getSessionsAttendanceOverview(Integer teamId, String status, java.time.LocalDate startDate, java.time.LocalDate endDate, Pageable pageable);
}
