package com.example.Rural.management.service;

import com.example.Rural.management.exception.ResourceNotFoundException;
import com.example.Rural.management.model.Scheme;
import com.example.Rural.management.repository.SchemeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SchemeService {

    private final SchemeRepository schemeRepository;

    public SchemeService(SchemeRepository schemeRepository) {
        this.schemeRepository = schemeRepository;
    }

    @Transactional(readOnly = true)
    public List<Scheme> getAllSchemes() {
        return schemeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Scheme getSchemeById(Long id) {
        return schemeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scheme", "id", id));
    }

    @Transactional(readOnly = true)
    public List<Scheme> getSchemesByCategory(String category) {
        return schemeRepository.findByCategoryIgnoreCase(category);
    }

    @Transactional(readOnly = true)
    public long getSchemeCount() {
        return schemeRepository.count();
    }

    public Scheme createScheme(Scheme scheme) {
        return schemeRepository.save(scheme);
    }

    public Scheme updateScheme(Long id, Scheme schemeDetails) {
        Scheme scheme = getSchemeById(id);
        scheme.setSchemeName(schemeDetails.getSchemeName());
        scheme.setCategory(schemeDetails.getCategory());
        scheme.setMinistry(schemeDetails.getMinistry());
        scheme.setSubsidyDetails(schemeDetails.getSubsidyDetails());
        scheme.setMaxBenefit(schemeDetails.getMaxBenefit());
        scheme.setEligibility(schemeDetails.getEligibility());
        scheme.setRequiredDocuments(schemeDetails.getRequiredDocuments());
        scheme.setPortalUrl(schemeDetails.getPortalUrl());
        scheme.setStatus(schemeDetails.getStatus());
        scheme.setDescription(schemeDetails.getDescription());
        return schemeRepository.save(scheme);
    }

    public void deleteScheme(Long id) {
        Scheme scheme = getSchemeById(id);
        schemeRepository.delete(scheme);
    }
}
