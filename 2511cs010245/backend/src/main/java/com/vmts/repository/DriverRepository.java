package com.vmts.repository;

import com.vmts.model.Driver;
import com.vmts.model.DriverStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DriverRepository extends JpaRepository<Driver, Long> {
  List<Driver> findAllByOrderByIdAsc();
  boolean existsByEmailIgnoreCase(String email);
  boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);
  boolean existsByLicenseNumberIgnoreCase(String licenseNumber);
  boolean existsByLicenseNumberIgnoreCaseAndIdNot(String licenseNumber, Long id);
  long countByStatus(DriverStatus status);
}
