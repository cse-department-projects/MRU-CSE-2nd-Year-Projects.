package com.example.demo.service;

import com.example.demo.model.Patient;
import com.example.demo.model.User;
import com.example.demo.repository.PatientRepository;
import com.example.demo.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public PatientService(
            PatientRepository patientRepository,
            UserRepository userRepository) {

        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    // Get all patients
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    // Get patient by ID
    public Patient getPatientById(Long id) {

        return patientRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Patient not found"));
    }

    // Get patient belonging to a specific user
    public Optional<Patient> getPatientByUserId(Long userId) {

        return patientRepository.findByUserId(userId);
    }

    // Create or update patient belonging to a user
    public Patient createPatient(
            Long userId,
            Patient patientData) {

        // Find the logged-in user
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Check whether this user already has a patient profile
        Optional<Patient> existingPatient =
                patientRepository.findByUserId(userId);

        Patient patient;

        if (existingPatient.isPresent()) {

            // Update existing profile
            patient = existingPatient.get();

        } else {

            // Create new profile
            patient = new Patient();

            patient.setUser(user);
        }

        // Set/update patient details
        patient.setName(patientData.getName());
        patient.setDateOfBirth(patientData.getDateOfBirth());
        patient.setGender(patientData.getGender());
        patient.setAddress(patientData.getAddress());
        patient.setEmergencyContact(
                patientData.getEmergencyContact()
        );

        return patientRepository.save(patient);
    }

    // Update patient by patient ID
    public Patient updatePatient(
            Long id,
            Patient updatedPatient) {

        Patient patient = getPatientById(id);

        patient.setName(updatedPatient.getName());
        patient.setDateOfBirth(
                updatedPatient.getDateOfBirth()
        );
        patient.setGender(updatedPatient.getGender());
        patient.setAddress(updatedPatient.getAddress());
        patient.setEmergencyContact(
                updatedPatient.getEmergencyContact()
        );

        return patientRepository.save(patient);
    }

    // Delete patient
    public void deletePatient(Long id) {

        if (!patientRepository.existsById(id)) {

            throw new RuntimeException("Patient not found");
        }

        patientRepository.deleteById(id);
    }
}