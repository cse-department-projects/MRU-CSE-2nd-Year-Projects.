package com.example.demo.service;

import com.example.demo.model.MedicationHistory;
import com.example.demo.repository.MedicationHistoryRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class MedicationHistoryService {

    private final MedicationHistoryRepository historyRepository;

    public MedicationHistoryService(
            MedicationHistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    public MedicationHistory addHistory(MedicationHistory history) {
        return historyRepository.save(history);
    }

    public List<MedicationHistory> getAllHistory() {
        return historyRepository.findAll();
    }

    public List<MedicationHistory> getHistoryByDate(LocalDate date) {
        return historyRepository.findByTakenDate(date);
    }

    public List<MedicationHistory> getHistoryByMedicine(Long medicineId) {
        return historyRepository.findByMedicineId(medicineId);
    }
}