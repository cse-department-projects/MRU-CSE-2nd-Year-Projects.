package com.example.demo.service;

import com.example.demo.model.Medicine;
import com.example.demo.repository.MedicineRepository;
import com.example.demo.repository.ReminderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final ReminderRepository reminderRepository;

    public MedicineService(
            MedicineRepository medicineRepository,
            ReminderRepository reminderRepository) {

        this.medicineRepository = medicineRepository;
        this.reminderRepository = reminderRepository;
    }

    // Get all medicines
    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }

    // Get medicines for a specific user
    public List<Medicine> getMedicinesByUser(Long userId) {
        return medicineRepository.findByUserId(userId);
    }

    // Get medicine by ID
    public Medicine getMedicineById(Long id) {
        return medicineRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Medicine not found"));
    }

    // Add medicine
    public Medicine addMedicine(Medicine medicine) {
        return medicineRepository.save(medicine);
    }

    // Update medicine
    public Medicine updateMedicine(
            Long id,
            Medicine updatedMedicine) {

        Medicine medicine = getMedicineById(id);

        medicine.setName(updatedMedicine.getName());
        medicine.setDosage(updatedMedicine.getDosage());
        medicine.setFrequency(updatedMedicine.getFrequency());
        medicine.setInstructions(updatedMedicine.getInstructions());

        return medicineRepository.save(medicine);
    }

    // Update dosage entered while creating a reminder
    public Medicine updateReminderDosage(
            Long id,
            String dosage) {

        Medicine medicine = getMedicineById(id);

        medicine.setDosage(dosage);

        return medicineRepository.save(medicine);
    }

    // Delete medicine
    public void deleteMedicine(Long id) {

        if (!medicineRepository.existsById(id)) {
            throw new RuntimeException("Medicine not found");
        }

        // Delete reminders first because of foreign key
        reminderRepository.deleteByMedicineId(id);

        // Then delete medicine
        medicineRepository.deleteById(id);
    }
}