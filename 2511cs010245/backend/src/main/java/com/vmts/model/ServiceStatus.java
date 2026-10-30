package com.vmts.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ServiceStatus {
  SCHEDULED("Scheduled"),
  COMPLETED("Completed"),
  DUE_SOON("Due Soon"),
  OVERDUE("Overdue");

  private final String label;

  ServiceStatus(String label) {
    this.label = label;
  }

  @JsonValue
  public String getLabel() {
    return label;
  }

  @JsonCreator
  public static ServiceStatus fromLabel(String value) {
    for (ServiceStatus s : values()) {
      if (s.label.equalsIgnoreCase(value) || s.name().equalsIgnoreCase(value)) return s;
    }
    throw new IllegalArgumentException("Unknown service status: " + value);
  }
}
