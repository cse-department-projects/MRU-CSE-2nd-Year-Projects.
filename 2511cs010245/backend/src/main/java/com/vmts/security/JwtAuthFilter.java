package com.vmts.security;

import com.vmts.model.User;
import com.vmts.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** Reads "Authorization: Bearer <token>" and populates the security context. */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

  private final JwtService jwtService;
  private final UserRepository userRepository;

  public JwtAuthFilter(JwtService jwtService, UserRepository userRepository) {
    this.jwtService = jwtService;
    this.userRepository = userRepository;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {

    String header = request.getHeader("Authorization");
    if (header != null && header.startsWith("Bearer ")
        && SecurityContextHolder.getContext().getAuthentication() == null) {
      try {
        Claims claims = jwtService.parse(header.substring(7));
        Long userId = Long.valueOf(claims.getSubject());
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
          AuthenticatedUser principal = new AuthenticatedUser(
              user.getId(), user.getName(), user.getEmail(), user.getRole(),
              user.getDriver() != null ? user.getDriver().getId() : null);
          var auth = new UsernamePasswordAuthenticationToken(
              principal, null,
              List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
          SecurityContextHolder.getContext().setAuthentication(auth);
        }
      } catch (JwtException | IllegalArgumentException ignored) {
        // Invalid or expired token: request continues unauthenticated and is rejected by Spring Security.
      }
    }
    chain.doFilter(request, response);
  }
}
