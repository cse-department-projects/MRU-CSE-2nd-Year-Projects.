package com.vmts.dto;

import java.util.List;

public record DashboardStatsResponse(
    long totalVehicles,
    long activeVehicles,
    long maintenanceVehicles,
    long totalDrivers,
    long activeDrivers,
    long servicesDueSoon,
    long overdueServices,
    List<ServiceDtos.ServiceResponse> serviceAlerts,
    List<AuditLogResponse> recentActivity) {}
