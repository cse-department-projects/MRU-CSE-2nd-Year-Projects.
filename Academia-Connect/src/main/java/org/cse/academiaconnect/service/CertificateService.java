package org.cse.academiaconnect.service;

import jakarta.persistence.EntityNotFoundException;
import org.cse.academiaconnect.entity.Certificate;
import org.cse.academiaconnect.repository.CertificateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.time.LocalDate;
import org.cse.academiaconnect.entity.User;
import org.cse.academiaconnect.entity.Activity;

/**
 * Service class managing Certificate business logic.
 * Uses constructor injection and handles clean CRUD operations.
 */
@Service
@Transactional
public class CertificateService {

    private final CertificateRepository certificateRepository;

    public CertificateService(CertificateRepository certificateRepository) {
        this.certificateRepository = certificateRepository;
    }

    /**
     * Issue a Certificate.
     * Validates uniqueness and assigns a unique verification code.
     */
    public Certificate createCertificate(Certificate certificate) {
        if (certificateRepository.existsByUserIdAndActivityId(certificate.getUser().getId(), certificate.getActivity().getId())) {
            throw new IllegalArgumentException("Certificate has already been issued to this user for this activity");
        }

        if (certificate.getCertificateCode() == null || certificate.getCertificateCode().isBlank()) {
            certificate.setCertificateCode("CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        return certificateRepository.save(certificate);
    }

    /**
     * Retrieve all Certificates.
     */
    @Transactional(readOnly = true)
    public List<Certificate> getAllCertificates() {
        return certificateRepository.findAll();
    }

    /**
     * Retrieve a Certificate by ID.
     */
    @Transactional(readOnly = true)
    public Certificate getCertificateById(Long id) {
        return certificateRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Certificate not found with ID: " + id));
    }

    /**
     * Update Certificate details.
     */
    public Certificate updateCertificate(Long id, Certificate certificateDetails) {
        Certificate existingCertificate = getCertificateById(id);
        existingCertificate.setCredentialUrl(certificateDetails.getCredentialUrl());
        existingCertificate.setIssueDate(certificateDetails.getIssueDate());
        return certificateRepository.save(existingCertificate);
    }

    /**
     * Delete/Revoke a Certificate by ID.
     */
    public void deleteCertificate(Long id) {
        Certificate certificate = getCertificateById(id);
        certificateRepository.delete(certificate);
    }

@Transactional(readOnly = true)
public List<Certificate> getCertificatesByUser(Long userId) {
    return certificateRepository.findByUserId(userId);
}

@Transactional(readOnly = true)
public boolean hasCertificate(Long userId, Long activityId) {
    return certificateRepository.existsByUserIdAndActivityId(userId, activityId);
}

public Certificate issueCertificate(User user, Activity activity) {

    if (certificateRepository.existsByUserIdAndActivityId(
            user.getId(),
            activity.getId())) {

        throw new IllegalArgumentException(
                "Certificate has already been issued to this participant."
        );
    }

    Certificate certificate = new Certificate();

    certificate.setUser(user);
    certificate.setActivity(activity);
    certificate.setIssueDate(LocalDate.now());

    String certificateCode =
            "CERT-" + UUID.randomUUID()
                    .toString()
                    .substring(0, 8)
                    .toUpperCase();

    certificate.setCertificateCode(certificateCode);

    certificate.setCredentialUrl(
            "/certificates/verify/" + certificateCode
    );

    return certificateRepository.save(certificate);
}
@Transactional(readOnly = true)
public Certificate getCertificateByCode(String certificateCode) {
    return certificateRepository.findByCertificateCode(certificateCode)
            .orElseThrow(() ->
                    new EntityNotFoundException(
                            "Certificate not found with code: " + certificateCode
                    )
            );
}
}