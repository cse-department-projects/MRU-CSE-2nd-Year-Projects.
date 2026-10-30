package com.smartvillage.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "soil_test_requests")
public class SoilTestRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String reqNumber;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String farmerName;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal landAreaAcres;

    @Column(length = 30)
    private String surveyNumber;

    @Column(length = 100)
    private String sampleLocation;

    @Column(length = 20)
    private String status = "REQUESTED"; // REQUESTED, SAMPLE_COLLECTED, IN_LAB, REPORT_READY

    @Column(columnDefinition = "TEXT")
    private String resultSummary;

    private LocalDateTime createdAt = LocalDateTime.now();

    public SoilTestRequest() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReqNumber() { return reqNumber; }
    public void setReqNumber(String reqNumber) { this.reqNumber = reqNumber; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getFarmerName() { return farmerName; }
    public void setFarmerName(String farmerName) { this.farmerName = farmerName; }

    public BigDecimal getLandAreaAcres() { return landAreaAcres; }
    public void setLandAreaAcres(BigDecimal landAreaAcres) { this.landAreaAcres = landAreaAcres; }

    public String getSurveyNumber() { return surveyNumber; }
    public void setSurveyNumber(String surveyNumber) { this.surveyNumber = surveyNumber; }

    public String getSampleLocation() { return sampleLocation; }
    public void setSampleLocation(String sampleLocation) { this.sampleLocation = sampleLocation; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getResultSummary() { return resultSummary; }
    public void setResultSummary(String resultSummary) { this.resultSummary = resultSummary; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
