package com.vmts.controller;

import com.vmts.dto.DriverDtos.DriverRequest;
import com.vmts.dto.DriverDtos.DriverResponse;
import com.vmts.service.DriverService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

  private final DriverService driverService;

  public DriverController(DriverService driverService) {
    this.driverService = driverService;
  }

  @GetMapping
  public List<DriverResponse> list() {
    return driverService.findAll();
  }

  @GetMapping("/{id}")
  public DriverResponse get(@PathVariable Long id) {
    return driverService.findById(id);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public DriverResponse create(@Valid @RequestBody DriverRequest request) {
    return driverService.create(request);
  }

  @PutMapping("/{id}")
  public DriverResponse update(@PathVariable Long id, @Valid @RequestBody DriverRequest request) {
    return driverService.update(id, request);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    driverService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
