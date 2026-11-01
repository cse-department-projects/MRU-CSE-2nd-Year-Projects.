package com.example.Rural.management.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "farmers")
public class Farmer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Full name is required")
    @Column(nullable = false)
    private String fullName;

    private Double landSizeAcres;
    private String mainCrop;
    private String ward;
    private String status;
    private String contactPhone;
    private String soilType;
    private String irrigationType;
    private Double annualYieldQuintals;
    private String aadhaarMasked;
    private String villageArea;
    private String activeSchemes;

    public Farmer() {}

    public Farmer(String fullName, Double landSizeAcres, String mainCrop, String ward, String status,
                  String contactPhone, String soilType, String irrigationType, Double annualYieldQuintals,
                  String aadhaarMasked, String villageArea, String activeSchemes) {
        this.fullName = fullName;
        this.landSizeAcres = landSizeAcres;
        this.mainCrop = mainCrop;
        this.ward = ward;
        this.status = status;
        this.contactPhone = contactPhone;
        this.soilType = soilType;
        this.irrigationType = irrigationType;
        this.annualYieldQuintals = annualYieldQuintals;
        this.aadhaarMasked = aadhaarMasked;
        this.villageArea = villageArea;
        this.activeSchemes = activeSchemes;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Double getLandSizeAcres() { return landSizeAcres; }
    public void setLandSizeAcres(Double landSizeAcres) { this.landSizeAcres = landSizeAcres; }

    public String getMainCrop() { return mainCrop; }
    public void setMainCrop(String mainCrop) { this.mainCrop = mainCrop; }

    public String getWard() { return ward; }
    public void setWard(String ward) { this.ward = ward; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getSoilType() { return soilType; }
    public void setSoilType(String soilType) { this.soilType = soilType; }

    public String getIrrigationType() { return irrigationType; }
    public void setIrrigationType(String irrigationType) { this.irrigationType = irrigationType; }

    public Double getAnnualYieldQuintals() { return annualYieldQuintals; }
    public void setAnnualYieldQuintals(Double annualYieldQuintals) { this.annualYieldQuintals = annualYieldQuintals; }

    public String getAadhaarMasked() { return aadhaarMasked; }
    public void setAadhaarMasked(String aadhaarMasked) { this.aadhaarMasked = aadhaarMasked; }

    public String getVillageArea() { return villageArea; }
    public void setVillageArea(String villageArea) { this.villageArea = villageArea; }

    public String getActiveSchemes() { return activeSchemes; }
    public void setActiveSchemes(String activeSchemes) { this.activeSchemes = activeSchemes; }
}
