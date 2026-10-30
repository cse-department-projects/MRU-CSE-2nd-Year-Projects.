package com.vmts.service;

import com.vmts.dto.ServiceDtos.ServiceResponse;
import com.vmts.dto.VehicleDtos.DriverVehicleUpdateRequest;
import com.vmts.dto.VehicleDtos.StartVehicleRequest;
import com.vmts.dto.VehicleDtos.VehicleResponse;
import com.vmts.exception.NotFoundException;
import com.vmts.model.Vehicle;
import com.vmts.repository.VehicleRepository;
import com.vmts.security.AuthenticatedUser;
import com.vmts.security.CurrentUser;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Self-service actions available to a signed-in driver for their own vehicle only. */
@Service
@Transactional
public class DriverPortalService {

  private final VehicleRepository vehicleRepository;
  private final ServiceRecordService serviceRecordService;
  private final CurrentUser currentUser;
  private final AuditService auditService;

  public DriverPortalService(VehicleRepository vehicleRepository, ServiceRecordService serviceRecordService,
      CurrentUser currentUser, AuditService auditService) {
    this.vehicleRepository = vehicleRepository;
    this.serviceRecordService = serviceRecordService;
    this.currentUser = currentUser;
    this.auditService = auditService;
  }

  @Transactional(readOnly = true)
  public VehicleResponse myVehicle() {
    return VehicleResponse.from(assignedVehicle());
  }

  @Transactional(readOnly = true)
  public List<ServiceResponse> myVehicleServices() {
    return serviceRecordService.findByVehicle(assignedVehicle().getId());
  }

  public VehicleResponse updateStatus(DriverVehicleUpdateRequest request) {
    Vehicle vehicle = assignedVehicle();
    vehicle.setStatus(request.status());
    if (request.remarks() != null) vehicle.setRemarks(request.remarks());
    vehicle.setLastUpdated(LocalDateTime.now());
    touchDriver(vehicle);
    auditService.record("Updated", "Vehicle Status", vehicle.getRegistrationNumber());
    return VehicleResponse.from(vehicle);
  }

  public VehicleResponse start(StartVehicleRequest request) {
    Vehicle vehicle = assignedVehicle();
    vehicle.setLastStartAt(request.startTime());
    if (request.remarks() != null && !request.remarks().isBlank()) vehicle.setRemarks(request.remarks());
    vehicle.setLastUpdated(LocalDateTime.now());
    touchDriver(vehicle);
    auditService.record("Logged Start", "Vehicle", vehicle.getRegistrationNumber());
    return VehicleResponse.from(vehicle);
  }

  private void touchDriver(Vehicle vehicle) {
    if (vehicle.getDriver() != null) vehicle.getDriver().setLastActivity(LocalDateTime.now());
  }

  private Vehicle assignedVehicle() {
    AuthenticatedUser user = currentUser.get();
    if (user.driverId() == null) {
      throw new NotFoundException("Your account is not linked to a driver profile");
    }
    return vehicleRepository.findByDriverId(user.driverId())
        .orElseThrow(() -> new NotFoundException("No vehicle is currently assigned to you"));
  }
}
