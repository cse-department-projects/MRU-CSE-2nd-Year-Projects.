package com.example.demo.repository;

import com.example.demo.model.MedicationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MedicationHistoryRepository
        extends JpaRepository<MedicationHistory, Long> {

    List<MedicationHistory> findByTakenDate(LocalDate takenDate);

    List<MedicationHistory> findByMedicineId(Long medicineId);

    List<MedicationHistory> findByStatus(String status);
}