package com.logistics.controller;

import com.logistics.dto.ShipmentRequest;
import com.logistics.model.Driver;
import com.logistics.model.Shipment;
import com.logistics.model.Vehicle;
import com.logistics.repository.DriverRepository;
import com.logistics.repository.ShipmentRepository;
import com.logistics.repository.VehicleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shipments")
public class ShipmentController {

    private final ShipmentRepository shipmentRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;

    public ShipmentController(ShipmentRepository shipmentRepository,
                               VehicleRepository vehicleRepository,
                               DriverRepository driverRepository) {
        this.shipmentRepository = shipmentRepository;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
    }

    @GetMapping
    public List<Shipment> getAll() {
        return shipmentRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Shipment> getOne(@PathVariable Long id) {
        return shipmentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Public tracking lookup by tracking ID, e.g. GET /api/shipments/track/TRK-ABC12345
    @GetMapping("/track/{trackingId}")
    public ResponseEntity<Shipment> track(@PathVariable String trackingId) {
        return shipmentRepository.findByTrackingId(trackingId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Shipment> create(@RequestBody ShipmentRequest req) {
        Shipment shipment = new Shipment(req.getOrigin(), req.getDestination(), req.getCustomerName(),
                req.getWeightKg(), req.getStatus() != null ? req.getStatus() : Shipment.Status.PENDING);
        applyAssignments(shipment, req.getVehicleId(), req.getDriverId());
        return ResponseEntity.ok(shipmentRepository.save(shipment));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Shipment> update(@PathVariable Long id, @RequestBody ShipmentRequest req) {
        return shipmentRepository.findById(id)
                .map(s -> {
                    s.setOrigin(req.getOrigin());
                    s.setDestination(req.getDestination());
                    s.setCustomerName(req.getCustomerName());
                    s.setWeightKg(req.getWeightKg());
                    if (req.getStatus() != null) s.setStatus(req.getStatus());
                    applyAssignments(s, req.getVehicleId(), req.getDriverId());
                    return ResponseEntity.ok(shipmentRepository.save(s));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Quick status-only update, e.g. PATCH /api/shipments/3/status  { "status": "DELIVERED" }
    @PatchMapping("/{id}/status")
    public ResponseEntity<Shipment> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return shipmentRepository.findById(id)
                .map(s -> {
                    s.setStatus(Shipment.Status.valueOf(body.get("status")));
                    return ResponseEntity.ok(shipmentRepository.save(s));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!shipmentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        shipmentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Dashboard summary counts, used by the frontend home screen.
    @GetMapping("/stats/summary")
    public Map<String, Object> stats() {
        List<Shipment> all = shipmentRepository.findAll();
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalShipments", all.size());
        stats.put("pending", all.stream().filter(s -> s.getStatus() == Shipment.Status.PENDING).count());
        stats.put("inTransit", all.stream().filter(s -> s.getStatus() == Shipment.Status.IN_TRANSIT).count());
        stats.put("delivered", all.stream().filter(s -> s.getStatus() == Shipment.Status.DELIVERED).count());
        stats.put("totalVehicles", vehicleRepository.count());
        stats.put("totalDrivers", driverRepository.count());
        return stats;
    }

    private void applyAssignments(Shipment shipment, Long vehicleId, Long driverId) {
        if (vehicleId != null) {
            Vehicle v = vehicleRepository.findById(vehicleId).orElse(null);
            shipment.setVehicle(v);
        }
        if (driverId != null) {
            Driver d = driverRepository.findById(driverId).orElse(null);
            shipment.setDriver(d);
        }
    }
}
