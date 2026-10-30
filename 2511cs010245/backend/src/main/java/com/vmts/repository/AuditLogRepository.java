package com.vmts.repository;

import com.vmts.model.AuditLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
  List<AuditLog> findAllByOrderByTimestampDescIdDesc();
  List<AuditLog> findTop10ByOrderByTimestampDescIdDesc();
}
