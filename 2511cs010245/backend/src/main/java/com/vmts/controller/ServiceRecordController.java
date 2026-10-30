package com.vmts.controller;

import com.vmts.dto.ServiceDtos.ServiceRequest;
import com.vmts.dto.ServiceDtos.ServiceResponse;
import com.vmts.service.ServiceRecordService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/services")
public class ServiceRecordController {

  private final ServiceRecordService service;

  public ServiceRecordController(ServiceRecordService service) {
    this.service = service;
  }

  @GetMapping
  public List<ServiceResponse> list() {
    return service.findAll();
  }

  @GetMapping("/{id}")
  public ServiceResponse get(@PathVariable Long id) {
    return service.findById(id);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ServiceResponse create(@Valid @RequestBody ServiceRequest request) {
    return service.create(request);
  }

  @PutMapping("/{id}")
  public ServiceResponse update(@PathVariable Long id, @Valid @RequestBody ServiceRequest request) {
    return service.update(id, request);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    service.delete(id);
    return ResponseEntity.noContent().build();
  }
}
