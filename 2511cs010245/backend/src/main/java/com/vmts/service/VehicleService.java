package com.vmts.service;

import com.vmts.dto.VehicleDtos.VehicleRequest;
import com.vmts.dto.VehicleDtos.VehicleResponse;
import com.vmts.exception.ConflictException;
import com.vmts.exception.NotFoundException;
import com.vmts.model.Driver;
import com.vmts.model.Vehicle;
import com.vmts.repository.DriverRepository;
import com.vmts.repository.ServiceRecordRepository;
import com.vmts.repository.VehicleLocationRepository;
import com.vmts.repository.VehicleRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class VehicleService {

  private final VehicleRepository vehicleRepository;
  private final DriverRepository driverRepository;
  private final ServiceRecordRepository serviceRecordRepository;
  private final VehicleLocationRepository locationRepository;
  private final AuditService auditService;

  public VehicleService(VehicleRepository vehicleRepository, DriverRepository driverRepository,
      ServiceRecordRepository serviceRecordRepository, VehicleLocationRepository locationRepository,
      AuditService auditService) {
    this.vehicleRepository = vehicleRepository;
    this.driverRepository = driverRepository;
    this.serviceRecordRepository = serviceRecordRepository;
    this.locationRepository = locationRepository;
    this.auditService = auditService;
  }

  @Transactional(readOnly = true)
  public List<VehicleResponse> findAll() {
    return vehicleRepository.findAllByOrderByIdAsc().stream().map(VehicleResponse::from).toList();
  }

  @Transactional(readOnly = true)
  public VehicleResponse findById(Long id) {
    return VehicleResponse.from(getVehicle(id));
  }

  public VehicleResponse create(VehicleRequest request) {
    if (vehicleRepository.existsByRegistrationNumberIgnoreCase(request.registrationNumber().trim())) {
      throw new ConflictException("A vehicle with this registration number already exists");
    }
    Vehicle vehicle = Vehicle.builder()
        .registrationNumber(request.registrationNumber().trim().toUpperCase())
        .manufacturer(request.manufacturer().trim())
        .model(request.model().trim())
        .year(request.year())
        .status(request.status())
        .remarks(request.remarks())
        .lastUpdated(LocalDateTime.now())
        .build();
    vehicle.setDriver(resolveDriver(request.driverId(), null));
    vehicle = vehicleRepository.save(vehicle);
    auditService.record("Created", "Vehicle", vehicle.getRegistrationNumber());
    return VehicleResponse.from(vehicle);
  }

  public VehicleResponse update(Long id, VehicleRequest request) {
    Vehicle vehicle = getVehicle(id);
    if (vehicleRepository.existsByRegistrationNumberIgnoreCaseAndIdNot(request.registrationNumber().trim(), id)) {
      throw new ConflictException("A vehicle with this registration number already exists");
    }
    vehicle.setRegistrationNumber(request.registrationNumber().trim().toUpperCase());
    vehicle.setManufacturer(request.manufacturer().trim());
    vehicle.setModel(request.model().trim());
    vehicle.setYear(request.year());
    vehicle.setStatus(request.status());
    vehicle.setRemarks(request.remarks());
    vehicle.setDriver(resolveDriver(request.driverId(), id));
    vehicle.setLastUpdated(LocalDateTime.now());
    auditService.record("Updated", "Vehicle", vehicle.getRegistrationNumber());
    return VehicleResponse.from(vehicle);
  }

  public void delete(Long id) {
    Vehicle vehicle = getVehicle(id);
    serviceRecordRepository.deleteByVehicleId(id);
    locationRepository.deleteByVehicleId(id);
    vehicleRepository.delete(vehicle);
    auditService.record("Deleted", "Vehicle", vehicle.getRegistrationNumber());
  }

  private Driver resolveDriver(Long driverId, Long vehicleId) {
    if (driverId == null) return null;
    Driver driver = driverRepository.findById(driverId)
        .orElseThrow(() -> new NotFoundException("Driver not found"));
    Vehicle existing = vehicleRepository.findByDriverId(driverId).orElse(null);
    if (existing != null && !existing.getId().equals(vehicleId)) {
      throw new ConflictException("That driver is already assigned to another vehicle");
    }
    return driver;
  }

  Vehicle getVehicle(Long id) {
    return vehicleRepository.findById(id).orElseThrow(() -> new NotFoundException("Vehicle not found"));
  }
}
