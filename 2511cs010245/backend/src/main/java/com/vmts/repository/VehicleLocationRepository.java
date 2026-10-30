package com.vmts.repository;

import com.vmts.model.VehicleLocation;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleLocationRepository extends JpaRepository<VehicleLocation, Long> {
  List<VehicleLocation> findAllByOrderByVehicleIdAsc();
  Optional<VehicleLocation> findByVehicleId(Long vehicleId);
  void deleteByVehicleId(Long vehicleId);
}
