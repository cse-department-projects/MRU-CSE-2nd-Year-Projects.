package com.vmts.controller;

import com.vmts.dto.ServiceDtos.ServiceResponse;
import com.vmts.dto.VehicleDtos.VehicleRequest;
import com.vmts.dto.VehicleDtos.VehicleResponse;
import com.vmts.service.ServiceRecordService;
import com.vmts.service.VehicleService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

  private final VehicleService vehicleService;
  private final ServiceRecordService serviceRecordService;

  public VehicleController(VehicleService vehicleService, ServiceRecordService serviceRecordService) {
    this.vehicleService = vehicleService;
    this.serviceRecordService = serviceRecordService;
  }

  @GetMapping
  public List<VehicleResponse> list() {
    return vehicleService.findAll();
  }

  @GetMapping("/{id}")
  public VehicleResponse get(@PathVariable Long id) {
    return vehicleService.findById(id);
  }

  @GetMapping("/{id}/services")
  public List<ServiceResponse> services(@PathVariable Long id) {
    return serviceRecordService.findByVehicle(id);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public VehicleResponse create(@Valid @RequestBody VehicleRequest request) {
    return vehicleService.create(request);
  }

  @PutMapping("/{id}")
  public VehicleResponse update(@PathVariable Long id, @Valid @RequestBody VehicleRequest request) {
    return vehicleService.update(id, request);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    vehicleService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
