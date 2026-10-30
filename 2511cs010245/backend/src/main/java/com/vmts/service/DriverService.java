package com.vmts.service;

import com.vmts.dto.DriverDtos.DriverRequest;
import com.vmts.dto.DriverDtos.DriverResponse;
import com.vmts.exception.ConflictException;
import com.vmts.exception.NotFoundException;
import com.vmts.model.Driver;
import com.vmts.model.DriverStatus;
import com.vmts.model.Vehicle;
import com.vmts.repository.DriverRepository;
import com.vmts.repository.UserRepository;
import com.vmts.repository.VehicleRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DriverService {

  private final DriverRepository driverRepository;
  private final VehicleRepository vehicleRepository;
  private final UserRepository userRepository;
  private final AuditService auditService;

  public DriverService(DriverRepository driverRepository, VehicleRepository vehicleRepository,
      UserRepository userRepository, AuditService auditService) {
    this.driverRepository = driverRepository;
    this.vehicleRepository = vehicleRepository;
    this.userRepository = userRepository;
    this.auditService = auditService;
  }

  @Transactional(readOnly = true)
  public List<DriverResponse> findAll() {
    return driverRepository.findAllByOrderByIdAsc().stream().map(DriverResponse::from).toList();
  }

  @Transactional(readOnly = true)
  public DriverResponse findById(Long id) {
    return DriverResponse.from(getDriver(id));
  }

  public DriverResponse create(DriverRequest request) {
    validateUnique(request, null);
    Driver driver = Driver.builder()
        .name(request.name().trim())
        .email(request.email().trim())
        .phone(request.phone().trim())
        .licenseNumber(request.licenseNumber().trim())
        .licenseStatus(request.licenseStatus())
        .status(request.status())
        .createdAt(LocalDate.now())
        .lastActivity(LocalDateTime.now())
        .build();
    driver = driverRepository.save(driver);
    assignVehicle(driver, request.vehicleId());
    auditService.record("Created", "Driver", driver.getName());
    return DriverResponse.from(driver);
  }

  public DriverResponse update(Long id, DriverRequest request) {
    Driver driver = getDriver(id);
    validateUnique(request, id);
    driver.setName(request.name().trim());
    driver.setEmail(request.email().trim());
    driver.setPhone(request.phone().trim());
    driver.setLicenseNumber(request.licenseNumber().trim());
    driver.setLicenseStatus(request.licenseStatus());
    driver.setStatus(request.status());
    driver.setLastActivity(LocalDateTime.now());
    assignVehicle(driver, request.vehicleId());
    auditService.record("Updated", "Driver", driver.getName());
    return DriverResponse.from(driver);
  }

  public void delete(Long id) {
    Driver driver = getDriver(id);
    vehicleRepository.findByDriverId(id).ifPresent(v -> v.setDriver(null));
    userRepository.findAll().stream()
        .filter(u -> u.getDriver() != null && u.getDriver().getId().equals(id))
        .forEach(u -> u.setDriver(null));
    driverRepository.delete(driver);
    auditService.record("Deleted", "Driver", driver.getName());
  }

  /** Keeps the one-driver-one-vehicle rule consistent from the driver side. */
  private void assignVehicle(Driver driver, Long vehicleId) {
    Vehicle current = vehicleRepository.findByDriverId(driver.getId()).orElse(null);
    if (vehicleId == null) {
      if (current != null) current.setDriver(null);
      driver.setVehicle(null);
      return;
    }
    Vehicle target = vehicleRepository.findById(vehicleId)
        .orElseThrow(() -> new NotFoundException("Vehicle not found"));
    if (target.getDriver() != null && !target.getDriver().getId().equals(driver.getId())) {
      throw new ConflictException("That vehicle is already assigned to another driver");
    }
    if (current != null && !current.getId().equals(vehicleId)) current.setDriver(null);
    target.setDriver(driver);
    target.setLastUpdated(LocalDateTime.now());
    driver.setVehicle(target);
  }

  private void validateUnique(DriverRequest request, Long id) {
    boolean emailTaken = id == null
        ? driverRepository.existsByEmailIgnoreCase(request.email().trim())
        : driverRepository.existsByEmailIgnoreCaseAndIdNot(request.email().trim(), id);
    if (emailTaken) throw new ConflictException("A driver with this email already exists");

    boolean licenseTaken = id == null
        ? driverRepository.existsByLicenseNumberIgnoreCase(request.licenseNumber().trim())
        : driverRepository.existsByLicenseNumberIgnoreCaseAndIdNot(request.licenseNumber().trim(), id);
    if (licenseTaken) throw new ConflictException("A driver with this license number already exists");
  }

  Driver getDriver(Long id) {
    return driverRepository.findById(id).orElseThrow(() -> new NotFoundException("Driver not found"));
  }

  @Transactional(readOnly = true)
  public long countActive() {
    return driverRepository.countByStatus(DriverStatus.ACTIVE);
  }
}
