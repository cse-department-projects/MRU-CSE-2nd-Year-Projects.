package org.cse.academiaconnect.repository;

import org.cse.academiaconnect.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Certificate entity operations.
 */

public interface CertificateRepository extends JpaRepository<Certificate, Long> {

    /**
     * Find a certificate by its unique certificate verification code.
     */
    Optional<Certificate> findByCertificateCode(String certificateCode);

    /**
     * Find all certificates issued to a specific user.
     */
    List<Certificate> findByUserId(Long userId);

    /**
     * Find the certificate issued to a specific user for a specific activity.
     */
    Optional<Certificate> findByUserIdAndActivityId(Long userId, Long activityId);

    /**
     * Check if a certificate with the given verification code already exists.
     */
    boolean existsByCertificateCode(String certificateCode);

    /**
     * Check if a certificate has already been issued to a user for a specific activity.
     */
    boolean existsByUserIdAndActivityId(Long userId, Long activityId);
}