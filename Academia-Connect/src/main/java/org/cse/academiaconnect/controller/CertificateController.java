package org.cse.academiaconnect.controller;

import jakarta.validation.Valid;
import org.cse.academiaconnect.entity.Certificate;
import org.cse.academiaconnect.service.CertificateService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/certificates")
@CrossOrigin(origins = "*")
public class CertificateController {

    private final CertificateService certificateService;

    public CertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    @PostMapping
    public ResponseEntity<Certificate> createCertificate(@Valid @RequestBody Certificate certificate) {
        return new ResponseEntity<>(certificateService.createCertificate(certificate), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Certificate>> getAllCertificates() {
        return ResponseEntity.ok(certificateService.getAllCertificates());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Certificate> getCertificateById(@PathVariable Long id) {
        return ResponseEntity.ok(certificateService.getCertificateById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Certificate> updateCertificate(@PathVariable Long id,
                                                         @Valid @RequestBody Certificate certificate) {
        return ResponseEntity.ok(certificateService.updateCertificate(id, certificate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCertificate(@PathVariable Long id) {
        certificateService.deleteCertificate(id);
        return ResponseEntity.ok("Certificate deleted successfully.");
    }
}