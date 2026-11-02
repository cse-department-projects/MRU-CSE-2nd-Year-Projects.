package com.athletehub.api.repository;

import com.athletehub.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE LOWER(u.email) = LOWER(:identifier) OR LOWER(u.fullName) = LOWER(:identifier) OR LOWER(u.email) LIKE LOWER(CONCAT(:identifier, '@%')) OR LOWER(u.fullName) LIKE LOWER(CONCAT(:identifier, ' %')) ORDER BY CASE WHEN LOWER(u.email) = LOWER(:identifier) THEN 1 WHEN LOWER(u.fullName) = LOWER(:identifier) THEN 2 ELSE 3 END")
    java.util.List<User> findMatchingUsers(@org.springframework.data.repository.query.Param("identifier") String identifier);

    default Optional<User> findByEmailOrUsername(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            return Optional.empty();
        }
        String clean = identifier.trim();
        String cleanLower = clean.toLowerCase();

        // 1. Direct email lookup (case-insensitive)
        for (User u : findAll()) {
            if (u.getEmail() != null && u.getEmail().trim().equalsIgnoreCase(cleanLower)) {
                return Optional.of(u);
            }
        }

        // 2. Exact full name match (case-insensitive)
        for (User u : findAll()) {
            if (u.getFullName() != null && u.getFullName().trim().equalsIgnoreCase(clean)) {
                return Optional.of(u);
            }
        }

        // 3. Match email prefix before @ (e.g. 'mangalisairam053' or 'sairam' from 'sairam@...')
        for (User u : findAll()) {
            if (u.getEmail() != null) {
                String prefix = u.getEmail().split("@")[0].toLowerCase().trim();
                if (prefix.equalsIgnoreCase(cleanLower) || cleanLower.equalsIgnoreCase(prefix)) {
                    return Optional.of(u);
                }
            }
        }

        // 4. Match full name ignoring spaces/special chars (e.g. "sairammangali" matches "Sairam Mangali")
        String strippedClean = cleanLower.replaceAll("[^a-z0-9]", "");
        if (!strippedClean.isEmpty()) {
            for (User u : findAll()) {
                if (u.getFullName() != null) {
                    String strippedName = u.getFullName().toLowerCase().replaceAll("[^a-z0-9]", "");
                    if (strippedName.equalsIgnoreCase(strippedClean)) {
                        return Optional.of(u);
                    }
                }
            }
        }

        // 5. First name or token match (e.g. "Sairam" in "Sairam Mangali")
        for (User u : findAll()) {
            if (u.getFullName() != null) {
                String[] tokens = u.getFullName().toLowerCase().split("\\s+");
                for (String t : tokens) {
                    if (t.equalsIgnoreCase(cleanLower)) {
                        return Optional.of(u);
                    }
                }
            }
        }

        // 6. Substring match in email or full name
        for (User u : findAll()) {
            if (u.getEmail() != null && u.getEmail().toLowerCase().contains(cleanLower)) {
                return Optional.of(u);
            }
            if (u.getFullName() != null && u.getFullName().toLowerCase().contains(cleanLower)) {
                return Optional.of(u);
            }
        }

        return Optional.empty();
    }

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE u.role.name = :roleName")
    java.util.List<User> findByRoleName(@org.springframework.data.repository.query.Param("roleName") String roleName);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE u.organization.id = :orgId")
    java.util.List<User> findByOrganizationId(@org.springframework.data.repository.query.Param("orgId") Integer orgId);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE u.organization.id = :orgId AND u.role.name = 'ROLE_ORG_ADMIN'")
    java.util.List<User> findOrgAdminsByOrganizationId(@org.springframework.data.repository.query.Param("orgId") Integer orgId);

    long countByOrganizationId(Integer orgId);

    @org.springframework.data.jpa.repository.Query("SELECT u.role.name, COUNT(u) FROM User u WHERE u.organization.id = :orgId GROUP BY u.role.name")
    java.util.List<Object[]> countUsersByRoleInOrganization(@org.springframework.data.repository.query.Param("orgId") Integer orgId);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE u.role.name = 'ROLE_ORG_ADMIN' AND u.organization IS NULL")
    java.util.List<User> findUnassignedAdmins();

    @org.springframework.data.jpa.repository.Query("SELECT u.role.name, COUNT(u) FROM User u GROUP BY u.role.name")
    java.util.List<Object[]> countAllUsersByRole();
}
