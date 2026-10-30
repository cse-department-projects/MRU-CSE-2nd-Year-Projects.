package com.vmts.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.vmts.model.AuditLog;
import com.vmts.model.Role;
import java.time.LocalDateTime;

public record AuditLogResponse(
    Long id,
    String user,
    String role,
    String action,
    String entity,
    String reference,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm") LocalDateTime timestamp) {

  public static AuditLogResponse from(AuditLog a) {
    return new AuditLogResponse(
        a.getId(),
        a.getUserName(),
        a.getRole() == Role.ADMIN ? "Admin" : "Driver",
        a.getAction(),
        a.getEntity(),
        a.getReference(),
        a.getTimestamp());
  }
}
