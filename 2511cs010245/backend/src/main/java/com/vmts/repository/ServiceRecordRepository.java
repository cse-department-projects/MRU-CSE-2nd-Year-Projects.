package com.vmts.repository;

import com.vmts.model.ServiceRecord;
import com.vmts.model.ServiceStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceRecordRepository extends JpaRepository<ServiceRecord, Long> {
  List<ServiceRecord> findAllByOrderByIdAsc();
  List<ServiceRecord> findByVehicleIdOrderByServiceDateDesc(Long vehicleId);
  long countByStatus(ServiceStatus status);
  void deleteByVehicleId(Long vehicleId);
}
