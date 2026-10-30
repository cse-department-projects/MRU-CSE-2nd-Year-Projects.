package com.vmts.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum LicenseStatus {
  VALID("Valid"),
  EXPIRING_SOON("Expiring Soon"),
  EXPIRED("Expired");

  private final String label;

  LicenseStatus(String label) {
    this.label = label;
  }

  @JsonValue
  public String getLabel() {
    return label;
  }

  @JsonCreator
  public static LicenseStatus fromLabel(String value) {
    for (LicenseStatus s : values()) {
      if (s.label.equalsIgnoreCase(value) || s.name().equalsIgnoreCase(value)) return s;
    }
    throw new IllegalArgumentException("Unknown license status: " + value);
  }
}
