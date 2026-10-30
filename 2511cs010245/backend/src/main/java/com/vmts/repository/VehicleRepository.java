package com.vmts.repository;

import com.vmts.model.Vehicle;
import com.vmts.model.VehicleStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
  List<Vehicle> findAllByOrderByIdAsc();
  Optional<Vehicle> findByDriverId(Long driverId);
  boolean existsByRegistrationNumberIgnoreCase(String registrationNumber);
  boolean existsByRegistrationNumberIgnoreCaseAndIdNot(String registrationNumber, Long id);
  long countByStatus(VehicleStatus status);
}
