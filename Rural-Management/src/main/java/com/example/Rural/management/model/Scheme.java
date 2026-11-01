package com.example.Rural.management.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "schemes")
public class Scheme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Scheme name is required")
    @Column(nullable = false)
    private String schemeName;

    private String category;
    private String ministry;
    private String subsidyDetails;
    private String maxBenefit;

    @Column(length = 1000)
    private String eligibility;

    @Column(length = 1000)
    private String requiredDocuments;

    private String portalUrl;
    private String status;

    @Column(length = 1000)
    private String description;

    public Scheme() {}

    public Scheme(String schemeName, String category, String ministry, String subsidyDetails,
                  String maxBenefit, String eligibility, String requiredDocuments,
                  String portalUrl, String status, String description) {
        this.schemeName = schemeName;
        this.category = category;
        this.ministry = ministry;
        this.subsidyDetails = subsidyDetails;
        this.maxBenefit = maxBenefit;
        this.eligibility = eligibility;
        this.requiredDocuments = requiredDocuments;
        this.portalUrl = portalUrl;
        this.status = status;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSchemeName() { return schemeName; }
    public void setSchemeName(String schemeName) { this.schemeName = schemeName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getMinistry() { return ministry; }
    public void setMinistry(String ministry) { this.ministry = ministry; }

    public String getSubsidyDetails() { return subsidyDetails; }
    public void setSubsidyDetails(String subsidyDetails) { this.subsidyDetails = subsidyDetails; }

    public String getMaxBenefit() { return maxBenefit; }
    public void setMaxBenefit(String maxBenefit) { this.maxBenefit = maxBenefit; }

    public String getEligibility() { return eligibility; }
    public void setEligibility(String eligibility) { this.eligibility = eligibility; }

    public String getRequiredDocuments() { return requiredDocuments; }
    public void setRequiredDocuments(String requiredDocuments) { this.requiredDocuments = requiredDocuments; }

    public String getPortalUrl() { return portalUrl; }
    public void setPortalUrl(String portalUrl) { this.portalUrl = portalUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
