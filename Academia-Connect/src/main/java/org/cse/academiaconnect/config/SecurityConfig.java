package org.cse.academiaconnect.config;

import org.cse.academiaconnect.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;

    public SecurityConfig(CustomUserDetailsService customUserDetailsService) {
        this.customUserDetailsService = customUserDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
.authenticationProvider(authenticationProvider())
                .authorizeHttpRequests(auth -> auth

        .requestMatchers(
                "/",
                "/login",
                "/register",
                "/css/**",
                "/js/**",
                "/images/**",
                "/certificates/verify/**"
        ).permitAll()

        .requestMatchers(
                "/organizer/**",
                "/activities/create",
                "/organizer/registrations/**"
        ).hasRole("ORGANIZER")

        .requestMatchers(
                "/dashboard",
                "/my-registrations",
                "/my-waitlist",
                "/my-certificates",
                "/activities/*/feedback"
        ).hasRole("USER")

        .requestMatchers(
                "/activities",
                "/activities/**",
                "/certificates/**"
        ).authenticated()

        .anyRequest().authenticated()
)

                .formLogin(form -> form
        .loginPage("/login")
        .loginProcessingUrl("/login")
        .successHandler((request, response, authentication) -> {

            boolean isOrganizer = authentication.getAuthorities()
                    .stream()
                    .anyMatch(authority ->
                            authority.getAuthority().equals("ROLE_ORGANIZER"));

            if (isOrganizer) {
                response.sendRedirect("/organizer");
            } else {
                response.sendRedirect("/dashboard");
            }
        })
        .failureUrl("/login?error=true")
        .permitAll()
)

                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/login?logout=true")
                        .permitAll()
                );

        return http.build();
    }

   @Bean
public DaoAuthenticationProvider authenticationProvider() {

    DaoAuthenticationProvider provider =
            new DaoAuthenticationProvider(customUserDetailsService);

    provider.setPasswordEncoder(passwordEncoder());

    return provider;
}

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}