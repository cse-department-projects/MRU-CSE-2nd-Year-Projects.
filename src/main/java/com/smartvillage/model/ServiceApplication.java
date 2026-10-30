package com.smartvillage.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_applications")
public class ServiceApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String appNumber;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String serviceName;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 20)
    private String status = "SUBMITTED"; // SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED

    private LocalDateTime submissionDate = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(length = 100)
    private String documentRef;

    public ServiceApplication() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAppNumber() { return appNumber; }
    public void setAppNumber(String appNumber) { this.appNumber = appNumber; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getSubmissionDate() { return submissionDate; }
    public void setSubmissionDate(LocalDateTime submissionDate) { this.submissionDate = submissionDate; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getDocumentRef() { return documentRef; }
    public void setDocumentRef(String documentRef) { this.documentRef = documentRef; }
}
