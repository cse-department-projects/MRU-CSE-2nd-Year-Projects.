package com.vmts.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum DriverStatus {
  ACTIVE("Active"),
  INACTIVE("Inactive"),
  SUSPENDED("Suspended");

  private final String label;

  DriverStatus(String label) {
    this.label = label;
  }

  @JsonValue
  public String getLabel() {
    return label;
  }

  @JsonCreator
  public static DriverStatus fromLabel(String value) {
    for (DriverStatus s : values()) {
      if (s.label.equalsIgnoreCase(value) || s.name().equalsIgnoreCase(value)) return s;
    }
    throw new IllegalArgumentException("Unknown driver status: " + value);
  }
}
