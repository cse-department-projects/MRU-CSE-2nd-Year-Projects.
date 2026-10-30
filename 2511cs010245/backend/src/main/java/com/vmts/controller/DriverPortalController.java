package com.vmts.controller;

import com.vmts.dto.ServiceDtos.ServiceResponse;
import com.vmts.dto.VehicleDtos.DriverVehicleUpdateRequest;
import com.vmts.dto.VehicleDtos.StartVehicleRequest;
import com.vmts.dto.VehicleDtos.VehicleResponse;
import com.vmts.service.DriverPortalService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.*;

/** Endpoints used by the Driver Dashboard and Driver Vehicle Update pages. */
@RestController
@RequestMapping("/api/driver")
public class DriverPortalController {

  private final DriverPortalService service;

  public DriverPortalController(DriverPortalService service) {
    this.service = service;
  }

  @GetMapping("/vehicle")
  public VehicleResponse myVehicle() {
    return service.myVehicle();
  }

  @GetMapping("/services")
  public List<ServiceResponse> myServices() {
    return service.myVehicleServices();
  }

  @PutMapping("/vehicle/status")
  public VehicleResponse updateStatus(@Valid @RequestBody DriverVehicleUpdateRequest request) {
    return service.updateStatus(request);
  }

  @PostMapping("/vehicle/start")
  public VehicleResponse start(@Valid @RequestBody StartVehicleRequest request) {
    return service.start(request);
  }
}
