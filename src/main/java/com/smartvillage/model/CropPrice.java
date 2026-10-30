package com.smartvillage.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "crop_prices")
public class CropPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String cropName;

    @Column(length = 30)
    private String category = "CEREAL";

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerQuintal;

    @Column(precision = 10, scale = 2)
    private BigDecimal minPrice;

    @Column(precision = 10, scale = 2)
    private BigDecimal maxPrice;

    @Column(length = 100)
    private String marketLocation = "Central Village Mandi";

    @Column(length = 10)
    private String trend = "STABLE"; // UP, DOWN, STABLE

    private LocalDateTime lastUpdated = LocalDateTime.now();

    public CropPrice() {}

    public CropPrice(String cropName, String category, BigDecimal pricePerQuintal, BigDecimal minPrice, BigDecimal maxPrice, String trend) {
        this.cropName = cropName;
        this.category = category;
        this.pricePerQuintal = pricePerQuintal;
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
        this.trend = trend;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCropName() { return cropName; }
    public void setCropName(String cropName) { this.cropName = cropName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getPricePerQuintal() { return pricePerQuintal; }
    public void setPricePerQuintal(BigDecimal pricePerQuintal) { this.pricePerQuintal = pricePerQuintal; }

    public BigDecimal getMinPrice() { return minPrice; }
    public void setMinPrice(BigDecimal minPrice) { this.minPrice = minPrice; }

    public BigDecimal getMaxPrice() { return maxPrice; }
    public void setMaxPrice(BigDecimal maxPrice) { this.maxPrice = maxPrice; }

    public String getMarketLocation() { return marketLocation; }
    public void setMarketLocation(String marketLocation) { this.marketLocation = marketLocation; }

    public String getTrend() { return trend; }
    public void setTrend(String trend) { this.trend = trend; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}
