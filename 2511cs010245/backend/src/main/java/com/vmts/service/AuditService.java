package com.vmts.service;

import com.vmts.dto.AuditLogResponse;
import com.vmts.model.AuditLog;
import com.vmts.repository.AuditLogRepository;
import com.vmts.security.AuthenticatedUser;
import com.vmts.security.CurrentUser;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Records every create/update/delete action so the Audit Trail page can display it. */
@Service
public class AuditService {

  private final AuditLogRepository repository;
  private final CurrentUser currentUser;

  public AuditService(AuditLogRepository repository, CurrentUser currentUser) {
    this.repository = repository;
    this.currentUser = currentUser;
  }

  public void record(String action, String entity, String reference) {
    AuthenticatedUser user = currentUser.get();
    repository.save(AuditLog.builder()
        .userName(user.name())
        .role(user.role())
        .action(action)
        .entity(entity)
        .reference(reference)
        .timestamp(LocalDateTime.now())
        .build());
  }

  @Transactional(readOnly = true)
  public List<AuditLogResponse> findAll() {
    return repository.findAllByOrderByTimestampDescIdDesc().stream().map(AuditLogResponse::from).toList();
  }

  @Transactional(readOnly = true)
  public List<AuditLogResponse> findRecent() {
    return repository.findTop10ByOrderByTimestampDescIdDesc().stream().map(AuditLogResponse::from).toList();
  }
}
