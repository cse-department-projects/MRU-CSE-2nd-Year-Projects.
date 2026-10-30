package com.vmts.controller;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

  /** Used by the React app to detect whether the backend is running. */
  @GetMapping("/api/health")
  public Map<String, String> health() {
    return Map.of("status", "UP", "service", "vmts-backend");
  }
}
