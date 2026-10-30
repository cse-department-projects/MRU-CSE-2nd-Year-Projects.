package com.vmts.controller;

import com.vmts.dto.LocationDtos.LocationRequest;
import com.vmts.dto.LocationDtos.LocationResponse;
import com.vmts.service.LocationService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

  private final LocationService locationService;

  public LocationController(LocationService locationService) {
    this.locationService = locationService;
  }

  @GetMapping
  public List<LocationResponse> list() {
    return locationService.findAll();
  }

  @GetMapping("/{vehicleId}")
  public LocationResponse get(@PathVariable Long vehicleId) {
    return locationService.findByVehicle(vehicleId);
  }

  @PutMapping("/{vehicleId}")
  public LocationResponse update(@PathVariable Long vehicleId, @Valid @RequestBody LocationRequest request) {
    return locationService.update(vehicleId, request);
  }
}
