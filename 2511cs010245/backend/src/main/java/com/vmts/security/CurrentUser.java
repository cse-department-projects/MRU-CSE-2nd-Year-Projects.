package com.vmts.security;

import com.vmts.exception.ForbiddenException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/** Convenience access to the authenticated principal of the current request. */
@Component
public class CurrentUser {

  public AuthenticatedUser get() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !(auth.getPrincipal() instanceof AuthenticatedUser user)) {
      throw new ForbiddenException("You must be signed in to perform this action");
    }
    return user;
  }
}
