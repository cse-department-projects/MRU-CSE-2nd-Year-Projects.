package com.vmts.config;

import com.vmts.security.JwtAuthFilter;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${vmts.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            JwtAuthFilter jwtAuthFilter) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            .sessionManagement(sm ->
                sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((req, res, e) -> {
                    res.setStatus(401);
                    res.setContentType("application/json");
                    res.getWriter().write(
                        "{\"status\":401,\"message\":\"Authentication required\"}"
                    );
                })

                .accessDeniedHandler((req, res, e) -> {
                    res.setStatus(403);
                    res.setContentType("application/json");
                    res.getWriter().write(
                        "{\"status\":403,\"message\":\"You do not have permission to perform this action\"}"
                    );
                })
            )

            .authorizeHttpRequests(auth -> auth

                // Allow CORS preflight requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Public endpoints
                .requestMatchers(
                    "/api/auth/login",
                    "/api/health"
                ).permitAll()

                // Authenticated user endpoint
                .requestMatchers("/api/auth/me").authenticated()

                // Driver endpoints
                .requestMatchers("/api/driver/**")
                .hasRole("DRIVER")

                // Locations
                .requestMatchers(HttpMethod.GET, "/api/locations/**")
                .authenticated()

                .requestMatchers(HttpMethod.PUT, "/api/locations/**")
                .authenticated()

                // Everything else under /api is ADMIN
                .requestMatchers("/api/**")
                .hasRole("ADMIN")

                // Everything else denied
                .anyRequest()
                .denyAll()
            )

            .addFilterBefore(
                jwtAuthFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        /*
         * Read allowed origins from application.properties.
         *
         * IMPORTANT:
         * Your frontend is running at:
         *
         * http://192.168.1.145:8080
         *
         * That address must exist in the
         * vmts.cors.allowed-origins property.
         */
        config.setAllowedOriginPatterns(
    Arrays.stream(allowedOrigins.split(","))
        .map(String::trim)
        .toList()
);

        config.setAllowedMethods(
            List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
            )
        );

        config.setAllowedHeaders(
            List.of(
                "Authorization",
                "Content-Type",
                "Accept"
            )
        );

        config.setAllowCredentials(false);

        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
            "/**",
            config
        );

        return source;
    }
}