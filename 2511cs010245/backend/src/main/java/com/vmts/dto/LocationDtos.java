package com.vmts.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.vmts.model.VehicleLocation;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public final class LocationDtos {
  private LocationDtos() {}

  public record LocationRequest(
      @NotNull(message = "Latitude is required")
      @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0") Double latitude,
      @NotNull(message = "Longitude is required")
      @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0") Double longitude,
      @Size(max = 160) String place) {}

  public record LocationResponse(
      Long vehicleId,
      String registrationNumber,
      Double latitude,
      Double longitude,
      String place,
      @JsonFormat(pattern = "yyyy-MM-dd HH:mm") LocalDateTime updatedAt) {

    public static LocationResponse from(VehicleLocation l) {
      return new LocationResponse(
          l.getVehicle().getId(),
          l.getVehicle().getRegistrationNumber(),
          l.getLatitude(),
          l.getLongitude(),
          l.getPlace(),
          l.getUpdatedAt());
    }
  }
}
