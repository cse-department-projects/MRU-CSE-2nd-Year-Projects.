package com.vmts.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.vmts.model.Vehicle;
import com.vmts.model.VehicleStatus;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public final class VehicleDtos {
  private VehicleDtos() {}

  public record VehicleRequest(
      @NotBlank(message = "Registration number is required")
      @Size(max = 20, message = "Registration number is too long")
      String registrationNumber,
      @NotBlank(message = "Manufacturer is required") @Size(max = 80) String manufacturer,
      @NotBlank(message = "Model is required") @Size(max = 80) String model,
      @NotNull(message = "Year is required")
      @Min(value = 1980, message = "Year must be 1980 or later")
      @Max(value = 2100, message = "Year is invalid")
      Integer year,
      Long driverId,
      @NotNull(message = "Status is required") VehicleStatus status,
      @Size(max = 500, message = "Remarks must be 500 characters or fewer") String remarks) {}

  /** Driver-side update: only status and remarks. */
  public record DriverVehicleUpdateRequest(
      @NotNull(message = "Status is required") VehicleStatus status,
      @Size(max = 500) String remarks) {}

  /** Driver-side "start vehicle" action. */
  public record StartVehicleRequest(
      @NotNull(message = "Start time is required")
      @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
      LocalDateTime startTime,
      @Size(max = 500) String remarks) {}

  public record VehicleResponse(
      Long id,
      String registrationNumber,
      String manufacturer,
      String model,
      Integer year,
      Long driverId,
      String driverName,
      VehicleStatus status,
      @JsonFormat(pattern = "yyyy-MM-dd HH:mm") LocalDateTime lastUpdated,
      @JsonFormat(pattern = "yyyy-MM-dd HH:mm") LocalDateTime lastStartAt,
      String remarks) {

    public static VehicleResponse from(Vehicle v) {
      return new VehicleResponse(
          v.getId(),
          v.getRegistrationNumber(),
          v.getManufacturer(),
          v.getModel(),
          v.getYear(),
          v.getDriver() != null ? v.getDriver().getId() : null,
          v.getDriver() != null ? v.getDriver().getName() : null,
          v.getStatus(),
          v.getLastUpdated(),
          v.getLastStartAt(),
          v.getRemarks() == null ? "" : v.getRemarks());
    }
  }
}
