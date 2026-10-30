package com.vmts.service;

import com.vmts.dto.LocationDtos.LocationRequest;
import com.vmts.dto.LocationDtos.LocationResponse;
import com.vmts.exception.ForbiddenException;
import com.vmts.exception.NotFoundException;
import com.vmts.model.Vehicle;
import com.vmts.model.VehicleLocation;
import com.vmts.repository.VehicleLocationRepository;
import com.vmts.repository.VehicleRepository;
import com.vmts.security.AuthenticatedUser;
import com.vmts.security.CurrentUser;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class LocationService {

  private final VehicleLocationRepository repository;
  private final VehicleRepository vehicleRepository;
  private final CurrentUser currentUser;
  private final AuditService auditService;

  public LocationService(VehicleLocationRepository repository, VehicleRepository vehicleRepository,
      CurrentUser currentUser, AuditService auditService) {
    this.repository = repository;
    this.vehicleRepository = vehicleRepository;
    this.currentUser = currentUser;
    this.auditService = auditService;
  }

  @Transactional(readOnly = true)
  public List<LocationResponse> findAll() {
    AuthenticatedUser user = currentUser.get();
    List<VehicleLocation> all = repository.findAllByOrderByVehicleIdAsc();
    if (user.isAdmin()) return all.stream().map(LocationResponse::from).toList();
    return all.stream()
        .filter(l -> l.getVehicle().getDriver() != null
            && l.getVehicle().getDriver().getId().equals(user.driverId()))
        .map(LocationResponse::from)
        .toList();
  }

  @Transactional(readOnly = true)
  public LocationResponse findByVehicle(Long vehicleId) {
    VehicleLocation location = repository.findByVehicleId(vehicleId)
        .orElseThrow(() -> new NotFoundException("No location recorded for this vehicle"));
    checkAccess(location.getVehicle());
    return LocationResponse.from(location);
  }

  public LocationResponse update(Long vehicleId, LocationRequest request) {
    Vehicle vehicle = vehicleRepository.findById(vehicleId)
        .orElseThrow(() -> new NotFoundException("Vehicle not found"));
    checkAccess(vehicle);
    VehicleLocation location = repository.findByVehicleId(vehicleId)
        .orElseGet(() -> VehicleLocation.builder().vehicle(vehicle).build());
    location.setLatitude(request.latitude());
    location.setLongitude(request.longitude());
    location.setPlace(request.place());
    location.setUpdatedAt(LocalDateTime.now());
    location = repository.save(location);
    auditService.record("Updated", "Location", vehicle.getRegistrationNumber());
    return LocationResponse.from(location);
  }

  /** Admins see every vehicle; a driver may only touch the vehicle assigned to them. */
  private void checkAccess(Vehicle vehicle) {
    AuthenticatedUser user = currentUser.get();
    if (user.isAdmin()) return;
    boolean ownsVehicle = vehicle.getDriver() != null
        && user.driverId() != null
        && vehicle.getDriver().getId().equals(user.driverId());
    if (!ownsVehicle) {
      throw new ForbiddenException("You can only access the vehicle assigned to you");
    }
  }
}
