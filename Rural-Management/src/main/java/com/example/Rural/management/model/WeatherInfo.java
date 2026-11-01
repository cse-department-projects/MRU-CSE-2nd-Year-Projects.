package com.example.Rural.management.model;

import jakarta.persistence.*;

@Entity
@Table(name = "weather_info")
public class WeatherInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String locationName;
    private Double currentTemp;
    private String conditionText;
    private Integer humidityPercentage;
    private Double windSpeedKmh;
    private Integer rainProbability;
    private String soilMoisture;

    @Column(length = 1000)
    private String farmerAdvisory;

    private String updatedTime;

    public WeatherInfo() {}

    public WeatherInfo(String locationName, Double currentTemp, String conditionText,
                       Integer humidityPercentage, Double windSpeedKmh, Integer rainProbability,
                       String soilMoisture, String farmerAdvisory, String updatedTime) {
        this.locationName = locationName;
        this.currentTemp = currentTemp;
        this.conditionText = conditionText;
        this.humidityPercentage = humidityPercentage;
        this.windSpeedKmh = windSpeedKmh;
        this.rainProbability = rainProbability;
        this.soilMoisture = soilMoisture;
        this.farmerAdvisory = farmerAdvisory;
        this.updatedTime = updatedTime;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }

    public Double getCurrentTemp() { return currentTemp; }
    public void setCurrentTemp(Double currentTemp) { this.currentTemp = currentTemp; }

    public String getConditionText() { return conditionText; }
    public void setConditionText(String conditionText) { this.conditionText = conditionText; }

    public Integer getHumidityPercentage() { return humidityPercentage; }
    public void setHumidityPercentage(Integer humidityPercentage) { this.humidityPercentage = humidityPercentage; }

    public Double getWindSpeedKmh() { return windSpeedKmh; }
    public void setWindSpeedKmh(Double windSpeedKmh) { this.windSpeedKmh = windSpeedKmh; }

    public Integer getRainProbability() { return rainProbability; }
    public void setRainProbability(Integer rainProbability) { this.rainProbability = rainProbability; }

    public String getSoilMoisture() { return soilMoisture; }
    public void setSoilMoisture(String soilMoisture) { this.soilMoisture = soilMoisture; }

    public String getFarmerAdvisory() { return farmerAdvisory; }
    public void setFarmerAdvisory(String farmerAdvisory) { this.farmerAdvisory = farmerAdvisory; }

    public String getUpdatedTime() { return updatedTime; }
    public void setUpdatedTime(String updatedTime) { this.updatedTime = updatedTime; }
}
