package com.vmts.service;

import com.vmts.dto.ServiceDtos.ServiceRequest;
import com.vmts.dto.ServiceDtos.ServiceResponse;
import com.vmts.exception.NotFoundException;
import com.vmts.model.ServiceRecord;
import com.vmts.model.ServiceStatus;
import com.vmts.model.Vehicle;
import com.vmts.repository.ServiceRecordRepository;
import com.vmts.repository.VehicleRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ServiceRecordService {

  private final ServiceRecordRepository repository;
  private final VehicleRepository vehicleRepository;
  private final AuditService auditService;

  public ServiceRecordService(ServiceRecordRepository repository, VehicleRepository vehicleRepository,
      AuditService auditService) {
    this.repository = repository;
    this.vehicleRepository = vehicleRepository;
    this.auditService = auditService;
  }

  @Transactional(readOnly = true)
  public List<ServiceResponse> findAll() {
    return repository.findAllByOrderByIdAsc().stream().map(ServiceResponse::from).toList();
  }

  @Transactional(readOnly = true)
  public ServiceResponse findById(Long id) {
    return ServiceResponse.from(get(id));
  }

  @Transactional(readOnly = true)
  public List<ServiceResponse> findByVehicle(Long vehicleId) {
    return repository.findByVehicleIdOrderByServiceDateDesc(vehicleId).stream()
        .map(ServiceResponse::from).toList();
  }

  public ServiceResponse create(ServiceRequest request) {
    Vehicle vehicle = vehicle(request.vehicleId());
    ServiceRecord record = ServiceRecord.builder()
        .vehicle(vehicle)
        .serviceType(request.serviceType().trim())
        .serviceDate(request.serviceDate())
        .nextServiceDate(request.nextServiceDate())
        .description(request.description())
        .status(request.status())
        .createdAt(LocalDate.now())
        .updatedAt(LocalDate.now())
        .build();
    record = repository.save(record);
    auditService.record("Created", "Service", vehicle.getRegistrationNumber() + " - " + record.getServiceType());
    return ServiceResponse.from(record);
  }

  public ServiceResponse update(Long id, ServiceRequest request) {
    ServiceRecord record = get(id);
    record.setVehicle(vehicle(request.vehicleId()));
    record.setServiceType(request.serviceType().trim());
    record.setServiceDate(request.serviceDate());
    record.setNextServiceDate(request.nextServiceDate());
    record.setDescription(request.description());
    record.setStatus(request.status());
    record.setUpdatedAt(LocalDate.now());
    auditService.record("Updated", "Service",
        record.getVehicle().getRegistrationNumber() + " - " + record.getServiceType());
    return ServiceResponse.from(record);
  }

  public void delete(Long id) {
    ServiceRecord record = get(id);
    repository.delete(record);
    auditService.record("Deleted", "Service",
        record.getVehicle().getRegistrationNumber() + " - " + record.getServiceType());
  }

  /** Services that are due soon or already overdue, newest first — used by the dashboard. */
  @Transactional(readOnly = true)
  public List<ServiceResponse> alerts() {
    return repository.findAllByOrderByIdAsc().stream()
        .filter(s -> s.getStatus() == ServiceStatus.DUE_SOON || s.getStatus() == ServiceStatus.OVERDUE)
        .map(ServiceResponse::from)
        .toList();
  }

  @Transactional(readOnly = true)
  public long countByStatus(ServiceStatus status) {
    return repository.countByStatus(status);
  }

  private Vehicle vehicle(Long id) {
    return vehicleRepository.findById(id).orElseThrow(() -> new NotFoundException("Vehicle not found"));
  }

  private ServiceRecord get(Long id) {
    return repository.findById(id).orElseThrow(() -> new NotFoundException("Service record not found"));
  }
}
