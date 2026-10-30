package com.vmts.dto;

import com.vmts.model.ServiceRecord;
import com.vmts.model.ServiceStatus;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

public final class ServiceDtos {
  private ServiceDtos() {}

  public record ServiceRequest(
      @NotNull(message = "Vehicle is required") Long vehicleId,
      @NotBlank(message = "Service type is required") @Size(max = 80) String serviceType,
      @NotNull(message = "Service date is required") LocalDate serviceDate,
      @NotNull(message = "Next service date is required") LocalDate nextServiceDate,
      @Size(max = 500) String description,
      @NotNull(message = "Status is required") ServiceStatus status) {}

  public record ServiceResponse(
      Long id,
      Long vehicleId,
      String vehicleRegistration,
      String serviceType,
      LocalDate serviceDate,
      LocalDate nextServiceDate,
      String description,
      ServiceStatus status,
      LocalDate createdAt,
      LocalDate updatedAt) {

    public static ServiceResponse from(ServiceRecord s) {
      return new ServiceResponse(
          s.getId(),
          s.getVehicle().getId(),
          s.getVehicle().getRegistrationNumber(),
          s.getServiceType(),
          s.getServiceDate(),
          s.getNextServiceDate(),
          s.getDescription() == null ? "" : s.getDescription(),
          s.getStatus(),
          s.getCreatedAt(),
          s.getUpdatedAt());
    }
  }
}
