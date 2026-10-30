package com.vmts.security;

import com.vmts.model.Role;

/** Lightweight principal stored in the SecurityContext for each request. */
public record AuthenticatedUser(Long id, String name, String email, Role role, Long driverId) {

  public boolean isAdmin() {
    return role == Role.ADMIN;
  }
}
