package com.vmts.controller;

import com.vmts.dto.AuditLogResponse;
import com.vmts.service.AuditService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

  private final AuditService auditService;

  public AuditLogController(AuditService auditService) {
    this.auditService = auditService;
  }

  @GetMapping
  public List<AuditLogResponse> list() {
    return auditService.findAll();
  }
}
