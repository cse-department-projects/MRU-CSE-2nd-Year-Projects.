package com.vmts.controller;

import com.vmts.dto.DashboardStatsResponse;
import com.vmts.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

  private final DashboardService dashboardService;

  public DashboardController(DashboardService dashboardService) {
    this.dashboardService = dashboardService;
  }

  @GetMapping("/stats")
  public DashboardStatsResponse stats() {
    return dashboardService.stats();
  }
}
