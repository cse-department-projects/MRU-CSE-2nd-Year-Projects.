package com.vmts.dto;

import com.vmts.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public final class AuthDtos {
  private AuthDtos() {}

  public record LoginRequest(
      @NotBlank(message = "Email is required") @Email(message = "Enter a valid email") String email,
      @NotBlank(message = "Password is required") String password) {}

  public record UserResponse(Long id, String name, String email, Role role, Long driverId) {}

  public record LoginResponse(String token, UserResponse user) {}
}
