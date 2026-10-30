package org.cse.academiaconnect.repository;

import org.cse.academiaconnect.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;



public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find a user by their unique username.
     */
    Optional<User> findByUsername(String username);

    /**
     * Find a user by their unique email address.
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if a user exists with the given username.
     */
    boolean existsByUsername(String username);

    /**
     * Check if a user exists with the given email.
     */
    boolean existsByEmail(String email);

    /**
     * Find all users belonging to a specific system role.
     */
    List<User> findByRole(User.UserRole role);

    /**
     * Find all users within a particular academic department.
     */
    List<User> findByDepartment(String department);
}