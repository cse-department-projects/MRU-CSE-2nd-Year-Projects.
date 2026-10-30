package com.smartvillage.service;

import com.smartvillage.model.ActivityLog;
import com.smartvillage.repository.ActivityLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    public void log(String username, String role, String action, String details, HttpServletRequest request) {
        log(username, role, action, details, "SUCCESS", request);
    }

    public void log(String username, String role, String action, String details, String status, HttpServletRequest request) {
        String ipAddress = "127.0.0.1";
        if (request != null) {
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) {
                ipAddress = forwarded.split(",")[0].trim();
            } else if (request.getRemoteAddr() != null) {
                ipAddress = request.getRemoteAddr();
            }
        }
        ActivityLog log = new ActivityLog(
            username != null ? username : "ANONYMOUS",
            role != null ? role : "SYSTEM",
            action,
            details,
            ipAddress,
            status != null ? status : "SUCCESS"
        );
        activityLogRepository.save(log);
    }

    public List<ActivityLog> getRecentLogs() {
        return activityLogRepository.findTop50ByOrderByTimestampDesc();
    }

    public List<ActivityLog> getAllLogs() {
        return activityLogRepository.findAllByOrderByTimestampDesc();
    }
}
