package com.vmts.service;

import com.vmts.dto.AuthDtos.LoginRequest;
import com.vmts.dto.AuthDtos.LoginResponse;
import com.vmts.dto.AuthDtos.UserResponse;
import com.vmts.model.User;
import com.vmts.repository.UserRepository;
import com.vmts.security.AuthenticatedUser;
import com.vmts.security.CurrentUser;
import com.vmts.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final CurrentUser currentUser;

  public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
      JwtService jwtService, CurrentUser currentUser) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.currentUser = currentUser;
  }

  @Transactional(readOnly = true)
  public LoginResponse login(LoginRequest request) {
    User user = userRepository.findByEmailIgnoreCase(request.email().trim())
        .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
    if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
      throw new BadCredentialsException("Invalid email or password");
    }
    return new LoginResponse(jwtService.generateToken(user), toResponse(user));
  }

  @Transactional(readOnly = true)
  public UserResponse me() {
    AuthenticatedUser principal = currentUser.get();
    return userRepository.findById(principal.id()).map(this::toResponse)
        .orElseThrow(() -> new BadCredentialsException("Invalid session"));
  }

  private UserResponse toResponse(User user) {
    return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(),
        user.getDriver() != null ? user.getDriver().getId() : null);
  }
}
