package com.logistics.controller;

import com.logistics.model.Driver;
import com.logistics.repository.DriverRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    private final DriverRepository driverRepository;

    public DriverController(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    @GetMapping
    public List<Driver> getAll() {
        return driverRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Driver> getOne(@PathVariable Long id) {
        return driverRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Driver> create(@Valid @RequestBody Driver driver) {
        return ResponseEntity.ok(driverRepository.save(driver));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Driver> update(@PathVariable Long id, @Valid @RequestBody Driver updated) {
        return driverRepository.findById(id)
                .map(d -> {
                    d.setName(updated.getName());
                    d.setLicenseNumber(updated.getLicenseNumber());
                    d.setPhone(updated.getPhone());
                    d.setStatus(updated.getStatus());
                    return ResponseEntity.ok(driverRepository.save(d));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!driverRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        driverRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
