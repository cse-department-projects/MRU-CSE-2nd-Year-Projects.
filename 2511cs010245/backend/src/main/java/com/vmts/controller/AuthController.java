package com.vmts.controller;

import com.vmts.dto.AuthDtos.LoginRequest;
import com.vmts.dto.AuthDtos.LoginResponse;
import com.vmts.dto.AuthDtos.UserResponse;
import com.vmts.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/login")
  public LoginResponse login(@Valid @RequestBody LoginRequest request) {
    return authService.login(request);
  }

  @GetMapping("/me")
  public UserResponse me() {
    return authService.me();
  }
}
