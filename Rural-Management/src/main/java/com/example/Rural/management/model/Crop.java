package com.example.Rural.management.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "crops")
public class Crop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Crop name is required")
    @Column(nullable = false)
    private String cropName;

    private String season;
    private Double areaHectares;
    private Double expectedYieldQuintals;
    private Double mspRatePerQuintal;
    private String waterRequirement;
    private String recommendedFertilizer;
    @Column(length = 1000)
    private String pestAdvisory;
    @Column(length = 1000)
    private String description;
    private String harvestMonth;

    public Crop() {}

    public Crop(String cropName, String season, Double areaHectares, Double expectedYieldQuintals,
                Double mspRatePerQuintal, String waterRequirement, String recommendedFertilizer,
                String pestAdvisory, String description, String harvestMonth) {
        this.cropName = cropName;
        this.season = season;
        this.areaHectares = areaHectares;
        this.expectedYieldQuintals = expectedYieldQuintals;
        this.mspRatePerQuintal = mspRatePerQuintal;
        this.waterRequirement = waterRequirement;
        this.recommendedFertilizer = recommendedFertilizer;
        this.pestAdvisory = pestAdvisory;
        this.description = description;
        this.harvestMonth = harvestMonth;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCropName() { return cropName; }
    public void setCropName(String cropName) { this.cropName = cropName; }

    public String getSeason() { return season; }
    public void setSeason(String season) { this.season = season; }

    public Double getAreaHectares() { return areaHectares; }
    public void setAreaHectares(Double areaHectares) { this.areaHectares = areaHectares; }

    public Double getExpectedYieldQuintals() { return expectedYieldQuintals; }
    public void setExpectedYieldQuintals(Double expectedYieldQuintals) { this.expectedYieldQuintals = expectedYieldQuintals; }

    public Double getMspRatePerQuintal() { return mspRatePerQuintal; }
    public void setMspRatePerQuintal(Double mspRatePerQuintal) { this.mspRatePerQuintal = mspRatePerQuintal; }

    public String getWaterRequirement() { return waterRequirement; }
    public void setWaterRequirement(String waterRequirement) { this.waterRequirement = waterRequirement; }

    public String getRecommendedFertilizer() { return recommendedFertilizer; }
    public void setRecommendedFertilizer(String recommendedFertilizer) { this.recommendedFertilizer = recommendedFertilizer; }

    public String getPestAdvisory() { return pestAdvisory; }
    public void setPestAdvisory(String pestAdvisory) { this.pestAdvisory = pestAdvisory; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getHarvestMonth() { return harvestMonth; }
    public void setHarvestMonth(String harvestMonth) { this.harvestMonth = harvestMonth; }
}
