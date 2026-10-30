package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "medication_history")
public class MedicationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Column(nullable = false)
    private LocalDate takenDate;

    @Column(nullable = false)
    private LocalTime takenTime;

    @Column(nullable = false)
    private String status;

    public MedicationHistory() {
    }

    public MedicationHistory(Medicine medicine, LocalDate takenDate,
                             LocalTime takenTime, String status) {
        this.medicine = medicine;
        this.takenDate = takenDate;
        this.takenTime = takenTime;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Medicine getMedicine() {
        return medicine;
    }

    public void setMedicine(Medicine medicine) {
        this.medicine = medicine;
    }

    public LocalDate getTakenDate() {
        return takenDate;
    }

    public void setTakenDate(LocalDate takenDate) {
        this.takenDate = takenDate;
    }

    public LocalTime getTakenTime() {
        return takenTime;
    }

    public void setTakenTime(LocalTime takenTime) {
        this.takenTime = takenTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}