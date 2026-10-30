package com.vmts.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Stored as the enum name; serialised with the human readable label used by the frontend. */
public enum VehicleStatus {
  ACTIVE("Active"),
  INACTIVE("Inactive"),
  MAINTENANCE("Maintenance");

  private final String label;

  VehicleStatus(String label) {
    this.label = label;
  }

  @JsonValue
  public String getLabel() {
    return label;
  }

  @JsonCreator
  public static VehicleStatus fromLabel(String value) {
    for (VehicleStatus s : values()) {
      if (s.label.equalsIgnoreCase(value) || s.name().equalsIgnoreCase(value)) return s;
    }
    throw new IllegalArgumentException("Unknown vehicle status: " + value);
  }
}
