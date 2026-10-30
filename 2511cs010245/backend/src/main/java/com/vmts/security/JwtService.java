package com.vmts.security;

import com.vmts.config.JwtProperties;
import com.vmts.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

/** Creates and validates stateless JWT access tokens. */
@Service
public class JwtService {

  private final SecretKey key;
  private final long expirationMillis;

  public JwtService(JwtProperties props) {
    if (props.secret() == null || props.secret().length() < 32) {
      throw new IllegalStateException("vmts.jwt.secret must be at least 32 characters");
    }
    this.key = Keys.hmacShaKeyFor(props.secret().getBytes(StandardCharsets.UTF_8));
    this.expirationMillis = props.expirationMinutes() * 60_000L;
  }

  public String generateToken(User user) {
    Date now = new Date();
    return Jwts.builder()
        .subject(String.valueOf(user.getId()))
        .claim("email", user.getEmail())
        .claim("role", user.getRole().name())
        .issuedAt(now)
        .expiration(new Date(now.getTime() + expirationMillis))
        .signWith(key)
        .compact();
  }

  /** Returns the parsed claims or throws a JwtException when invalid/expired. */
  public Claims parse(String token) {
    return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
  }
}
