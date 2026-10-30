package com.vmts.service;

import com.vmts.dto.DashboardStatsResponse;
import com.vmts.model.DriverStatus;
import com.vmts.model.ServiceStatus;
import com.vmts.model.VehicleStatus;
import com.vmts.repository.DriverRepository;
import com.vmts.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

  private final VehicleRepository vehicleRepository;
  private final DriverRepository driverRepository;
  private final ServiceRecordService serviceRecordService;
  private final AuditService auditService;

  public DashboardService(VehicleRepository vehicleRepository, DriverRepository driverRepository,
      ServiceRecordService serviceRecordService, AuditService auditService) {
    this.vehicleRepository = vehicleRepository;
    this.driverRepository = driverRepository;
    this.serviceRecordService = serviceRecordService;
    this.auditService = auditService;
  }

  @Transactional(readOnly = true)
  public DashboardStatsResponse stats() {
    return new DashboardStatsResponse(
        vehicleRepository.count(),
        vehicleRepository.countByStatus(VehicleStatus.ACTIVE),
        vehicleRepository.countByStatus(VehicleStatus.MAINTENANCE),
        driverRepository.count(),
        driverRepository.countByStatus(DriverStatus.ACTIVE),
        serviceRecordService.countByStatus(ServiceStatus.DUE_SOON),
        serviceRecordService.countByStatus(ServiceStatus.OVERDUE),
        serviceRecordService.alerts(),
        auditService.findRecent());
  }
}
