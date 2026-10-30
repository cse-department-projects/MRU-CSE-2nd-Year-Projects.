package com.vmts.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.vmts.model.Driver;
import com.vmts.model.DriverStatus;
import com.vmts.model.LicenseStatus;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

public final class DriverDtos {
  private DriverDtos() {}

  public record DriverRequest(
      @NotBlank(message = "Name is required") @Size(max = 120) String name,
      @NotBlank(message = "Email is required") @Email(message = "Enter a valid email") String email,
      @NotBlank(message = "Phone is required") @Size(max = 30) String phone,
      @NotBlank(message = "License number is required") @Size(max = 40) String licenseNumber,
      @NotNull(message = "License status is required") LicenseStatus licenseStatus,
      Long vehicleId,
      @NotNull(message = "Status is required") DriverStatus status) {}

  public record DriverResponse(
      Long id,
      String name,
      String email,
      String phone,
      String licenseNumber,
      LicenseStatus licenseStatus,
      Long vehicleId,
      String vehicleRegistration,
      DriverStatus status,
      LocalDate createdAt,
      @JsonFormat(pattern = "yyyy-MM-dd HH:mm") LocalDateTime lastActivity) {

    public static DriverResponse from(Driver d) {
      return new DriverResponse(
          d.getId(),
          d.getName(),
          d.getEmail(),
          d.getPhone(),
          d.getLicenseNumber(),
          d.getLicenseStatus(),
          d.getVehicle() != null ? d.getVehicle().getId() : null,
          d.getVehicle() != null ? d.getVehicle().getRegistrationNumber() : null,
          d.getStatus(),
          d.getCreatedAt(),
          d.getLastActivity());
    }
  }
}
