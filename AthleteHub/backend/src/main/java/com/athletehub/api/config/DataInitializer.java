package com.athletehub.api.config;

import com.athletehub.api.entity.Role;
import com.athletehub.api.entity.User;
import com.athletehub.api.repository.RoleRepository;
import com.athletehub.api.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, 
                                     RoleRepository roleRepository, 
                                     com.athletehub.api.repository.OrganizationRepository organizationRepository,
                                     PasswordEncoder passwordEncoder) {
        return args -> {
            // Repair old SUPER_ADMIN role if it exists without ROLE_ prefix
            roleRepository.findByName("SUPER_ADMIN").ifPresent(role -> {
                role.setName("ROLE_SUPER_ADMIN");
                roleRepository.save(role);
            });

            // Ensure all standard roles exist
            String[] standardRoles = {"ROLE_SUPER_ADMIN", "ROLE_ORG_ADMIN", "ROLE_COACH", "ROLE_ATHLETE", "ROLE_RECRUITER"};
            for (String roleName : standardRoles) {
                if (roleRepository.findByName(roleName).isEmpty()) {
                    Role role = new Role();
                    role.setName(roleName);
                    roleRepository.save(role);
                }
            }

            Role superAdminRole = roleRepository.findByName("ROLE_SUPER_ADMIN").orElseThrow();
            Role orgAdminRole = roleRepository.findByName("ROLE_ORG_ADMIN").orElseThrow();
            Role coachRole = roleRepository.findByName("ROLE_COACH").orElseThrow();
            Role athleteRole = roleRepository.findByName("ROLE_ATHLETE").orElseThrow();

            String defaultPassword = "Password123!";
            String defaultPasswordHash = passwordEncoder.encode(defaultPassword);

            // 1. Ensure SUPER_ADMIN accounts exist and have password Password123!
            // a) admin@athletehub.local
            User adminLocal = userRepository.findByEmail("admin@athletehub.local").orElse(null);
            if (adminLocal == null) {
                adminLocal = new User();
                adminLocal.setFullName("Default Admin");
                adminLocal.setEmail("admin@athletehub.local");
                adminLocal.setRole(superAdminRole);
            }
            adminLocal.setPasswordHash(defaultPasswordHash);
            adminLocal.setIsVerified(true);
            adminLocal.setStatus("Active");
            userRepository.save(adminLocal);

            // b) super_admin@athletehub.com
            User superAdminUser = userRepository.findByEmail("super_admin@athletehub.com").orElse(null);
            if (superAdminUser == null) {
                superAdminUser = new User();
                superAdminUser.setFullName("Super Admin");
                superAdminUser.setEmail("super_admin@athletehub.com");
                superAdminUser.setRole(superAdminRole);
            }
            superAdminUser.setPasswordHash(defaultPasswordHash);
            superAdminUser.setIsVerified(true);
            superAdminUser.setStatus("Active");
            userRepository.save(superAdminUser);

            // c) spring_admin@example.com (if present, keep it in sync with Password123!)
            userRepository.findByEmail("spring_admin@example.com").ifPresent(user -> {
                user.setPasswordHash(defaultPasswordHash);
                user.setStatus("Active");
                user.setIsVerified(true);
                userRepository.save(user);
            });

            // 2. Ensure super_org / ORG_ADMIN accounts exist and have password Password123!
            com.athletehub.api.entity.Organization activeOrg = organizationRepository.findAll().stream()
                    .filter(o -> !"Deleted".equalsIgnoreCase(o.getStatus()))
                    .findFirst()
                    .orElse(null);

            // a) super_org@athletehub.com
            User superOrgUser = userRepository.findByEmail("super_org@athletehub.com").orElse(null);
            if (superOrgUser == null) {
                superOrgUser = new User();
                superOrgUser.setFullName("Super Org");
                superOrgUser.setEmail("super_org@athletehub.com");
                superOrgUser.setRole(orgAdminRole);
            }
            superOrgUser.setOrganization(activeOrg);
            superOrgUser.setPasswordHash(defaultPasswordHash);
            superOrgUser.setIsVerified(true);
            superOrgUser.setStatus("Active");
            userRepository.save(superOrgUser);

            // b) MRU_ORG@gmail.com
            userRepository.findByEmail("MRU_ORG@gmail.com").ifPresent(user -> {
                user.setPasswordHash(defaultPasswordHash);
                user.setStatus("Active");
                user.setIsVerified(true);
                userRepository.save(user);
            });

            // c) stmartin@gmail.com
            userRepository.findByEmail("stmartin@gmail.com").ifPresent(user -> {
                user.setPasswordHash(defaultPasswordHash);
                user.setStatus("Active");
                user.setIsVerified(true);
                userRepository.save(user);
            });

            // 3. Ensure Coach and Athlete accounts have valid password Password123!
            userRepository.findByEmail("srikanth@gmail.com").ifPresent(user -> {
                user.setPasswordHash(defaultPasswordHash);
                user.setStatus("Active");
                user.setIsVerified(true);
                userRepository.save(user);
            });

            userRepository.findByEmail("coach.rajesh@mruh.edu").ifPresent(user -> {
                user.setPasswordHash(defaultPasswordHash);
                user.setStatus("Active");
                user.setIsVerified(true);
                userRepository.save(user);
            });

            userRepository.findByEmail("coach.vikram@mruh.edu").ifPresent(user -> {
                user.setPasswordHash(defaultPasswordHash);
                user.setStatus("Active");
                user.setIsVerified(true);
                userRepository.save(user);
            });

            userRepository.findByEmail("coach.priya@mruh.edu").ifPresent(user -> {
                user.setPasswordHash(defaultPasswordHash);
                user.setStatus("Active");
                user.setIsVerified(true);
                userRepository.save(user);
            });

            userRepository.findByEmail("mangalisairam053@gmail.com").ifPresent(user -> {
                user.setPasswordHash(defaultPasswordHash);
                user.setStatus("Active");
                user.setIsVerified(true);
                userRepository.save(user);
            });

            // 4. Ensure EVERY existing user in the system is Active, Verified, and has Password123!
            for (User u : userRepository.findAll()) {
                u.setStatus("Active");
                u.setIsVerified(true);
                u.setPasswordHash(defaultPasswordHash);
                userRepository.save(u);
            }

            logger.info("========================================================");
            logger.info("AthleteHub Authentication Data Initializer Synchronized:");
            logger.info(" - ALL USERS & ROLES initialized with Password123! (Active & Verified)");
            logger.info(" - ATHLETE:     sairam / mangalisairam053@gmail.com  -> Password123!");
            logger.info(" - SUPER_ADMIN: super_admin / admin@athletehub.local -> Password123!");
            logger.info(" - ORG_ADMIN:   super_org / MRU_ORG@gmail.com        -> Password123!");
            logger.info(" - COACH:       coach / srikanth@gmail.com           -> Password123!");
            logger.info("========================================================");
        };
    }
}
