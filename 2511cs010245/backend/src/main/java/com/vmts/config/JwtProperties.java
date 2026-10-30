package com.vmts.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Bound from vmts.jwt.* in application.properties. */
@ConfigurationProperties(prefix = "vmts.jwt")
public record JwtProperties(String secret, long expirationMinutes) {}
