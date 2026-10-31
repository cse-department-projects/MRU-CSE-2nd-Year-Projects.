package com.roadsafety.controller;

import com.roadsafety.model.EmergencyAlert;
import com.roadsafety.model.EmergencyContact;
import com.roadsafety.model.Hospital;
import com.roadsafety.model.SafetyRule;
import com.roadsafety.model.User;
import com.roadsafety.repository.EmergencyAlertRepository;
import com.roadsafety.repository.EmergencyContactRepository;
import com.roadsafety.repository.HospitalRepository;
import com.roadsafety.repository.SafetyRuleRepository;
import com.roadsafety.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ApiController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HospitalRepository hospitalRepository;

    @Autowired
    private EmergencyAlertRepository emergencyAlertRepository;

    @Autowired
    private EmergencyContactRepository emergencyContactRepository;

    @Autowired
    private SafetyRuleRepository safetyRuleRepository;

    // -------------------------------------------------------------
    // USER AUTHENTICATION & PROFILE ENDPOINTS
    // -------------------------------------------------------------
    @PostMapping("/auth/register")
    public ResponseEntity<Map<String, Object>> registerUser(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();

        if (userRepository.existsByEmail(user.getEmail())) {
            response.put("success", false);
            response.put("message", "Email is already registered! Please login.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("CITIZEN");
        }

        User savedUser = userRepository.save(user);
        response.put("success", true);
        response.put("message", "Registration successful! Welcome to SafeRoad SOS.");
        response.put("user", savedUser);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/auth/login")
    public ResponseEntity<Map<String, Object>> loginUser(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        Map<String, Object> response = new HashMap<>();

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword().equals(password)) {
                response.put("success", true);
                response.put("message", "Login successful!");
                response.put("user", user);
                return ResponseEntity.ok(response);
            }
        }

        response.put("success", false);
        response.put("message", "Invalid email or password!");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    // -------------------------------------------------------------
    // HOSPITALS & SOS DISPATCH ENDPOINTS
    // -------------------------------------------------------------
    @GetMapping("/hospitals")
    public List<Hospital> getHospitals(
            @RequestParam(required = false, defaultValue = "17.5621") Double lat,
            @RequestParam(required = false, defaultValue = "78.4485") Double lng) {
        
        List<Hospital> hospitals = hospitalRepository.findByIsActiveTrue();
        for (Hospital h : hospitals) {
            double straightDistance = calculateHaversineDistance(lat, lng, h.getLatitude(), h.getLongitude());
            double roadDistance = straightDistance * 1.22; // Realistic road network route factor
            double roundedDist = Math.round(roadDistance * 10.0) / 10.0;
            h.setDistanceFromUserKm(roundedDist);
            int eta = (int) Math.max(3, Math.round(roundedDist * 2.2 + 2));
            h.setEstimatedEtaMinutes(eta);
        }
        
        hospitals.sort(Comparator.comparing(Hospital::getDistanceFromUserKm));
        return hospitals;
    }

    @GetMapping("/hospitals/nearest")
    public ResponseEntity<Map<String, Object>> getNearestHospital(
            @RequestParam(required = false, defaultValue = "17.5621") Double lat,
            @RequestParam(required = false, defaultValue = "78.4485") Double lng) {
        
        List<Hospital> sortedHospitals = getHospitals(lat, lng);
        if (sortedHospitals.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Hospital nearest = sortedHospitals.get(0);
        String directionsUrl = "https://www.google.com/maps/dir/?api=1&origin=" + lat + "," + lng +
                "&destination=" + nearest.getLatitude() + "," + nearest.getLongitude();
        String telUri = "tel:" + nearest.getPhoneNumber();

        Map<String, Object> response = new HashMap<>();
        response.put("hospital", nearest);
        response.put("distanceKm", nearest.getDistanceFromUserKm());
        response.put("estimatedEtaMinutes", nearest.getEstimatedEtaMinutes());
        response.put("telUri", telUri);
        response.put("directionsUrl", directionsUrl);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/emergency/trigger")
    public ResponseEntity<Map<String, Object>> triggerEmergencySOS(@RequestBody Map<String, Object> payload) {
        Double lat = Double.parseDouble(payload.getOrDefault("latitude", "17.5621").toString());
        Double lng = Double.parseDouble(payload.getOrDefault("longitude", "78.4485").toString());
        String victimName = (String) payload.getOrDefault("victimName", "Accident Victim / Anonymous User");
        String victimPhone = (String) payload.getOrDefault("victimPhone", "+919876543210");
        String addressDetails = (String) payload.getOrDefault("addressDetails", "Live GPS Location Shared");
        String medicalNotes = (String) payload.getOrDefault("medicalNotes", "ACCIDENT EMERGENCY - URGENT AMBULANCE DISPATCH REQUIRED");
        Long hospitalId = payload.get("hospitalId") != null ? Long.parseLong(payload.get("hospitalId").toString()) : null;

        Hospital targetHospital = null;
        if (hospitalId != null) {
            targetHospital = hospitalRepository.findById(hospitalId).orElse(null);
        }

        if (targetHospital == null) {
            List<Hospital> sortedHospitals = getHospitals(lat, lng);
            if (!sortedHospitals.isEmpty()) {
                targetHospital = sortedHospitals.get(0);
            }
        }

        EmergencyAlert alert = new EmergencyAlert();
        alert.setVictimName(victimName);
        alert.setVictimPhone(victimPhone);
        alert.setLatitude(lat);
        alert.setLongitude(lng);
        alert.setAddressDetails(addressDetails);
        alert.setMedicalNotes(medicalNotes);
        alert.setStatus("PENDING");

        if (targetHospital != null) {
            alert.setAssignedHospitalId(targetHospital.getId());
            alert.setAssignedHospitalName(targetHospital.getName());
        } else {
            alert.setAssignedHospitalName("Emergency Medical Dispatch (108)");
        }

        EmergencyAlert savedAlert = emergencyAlertRepository.save(alert);

        String mapUrl = "https://maps.google.com/?q=" + lat + "," + lng;
        String smsBody = "EMERGENCY SOS ACCIDENT ALERT!\n" +
                "Victim: " + victimName + " (" + victimPhone + ")\n" +
                "Location Maps: " + mapUrl + "\n" +
                "Notes: " + medicalNotes + "\n" +
                "PLEASE DISPATCH AMBULANCE IMMEDIATELY.";

        String hospitalPhone = (targetHospital != null) ? targetHospital.getPhoneNumber() : "108";
        String encodedSms = URLEncoder.encode(smsBody, StandardCharsets.UTF_8);
        String smsUri = "sms:" + hospitalPhone + "?body=" + encodedSms;
        String telUri = "tel:" + hospitalPhone;

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("alertId", savedAlert.getId());
        response.put("assignedHospital", targetHospital != null ? targetHospital.getName() : "Emergency Dispatch");
        response.put("hospitalPhone", hospitalPhone);
        response.put("telUri", telUri);
        response.put("smsText", smsBody);
        response.put("smsUri", smsUri);
        response.put("mapUrl", mapUrl);
        response.put("message", "Emergency SOS registered successfully!");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/emergency/alerts")
    public List<EmergencyAlert> getAllAlerts(@RequestParam(required = false) Long hospitalId) {
        if (hospitalId != null) {
            return emergencyAlertRepository.findByAssignedHospitalIdOrderByCreatedAtDesc(hospitalId);
        }
        return emergencyAlertRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/emergency/alerts/{id}")
    public ResponseEntity<EmergencyAlert> getAlertStatus(@PathVariable Long id) {
        Optional<EmergencyAlert> alert = emergencyAlertRepository.findById(id);
        return alert.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/emergency/alerts/{id}/status")
    public ResponseEntity<EmergencyAlert> updateAlertStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        
        String newStatus = body.get("status");
        Optional<EmergencyAlert> alertOpt = emergencyAlertRepository.findById(id);
        if (alertOpt.isPresent()) {
            EmergencyAlert alert = alertOpt.get();
            if (newStatus != null) {
                alert.setStatus(newStatus.toUpperCase());
                emergencyAlertRepository.save(alert);
            }
            return ResponseEntity.ok(alert);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/safety-rules")
    public List<SafetyRule> getSafetyRules(@RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty()) {
            return safetyRuleRepository.findByCategory(category.toUpperCase());
        }
        return safetyRuleRepository.findAll();
    }

    @GetMapping("/emergency-contacts")
    public List<EmergencyContact> getEmergencyContacts() {
        return emergencyContactRepository.findAll();
    }

    @PostMapping("/emergency-contacts")
    public EmergencyContact addEmergencyContact(@RequestBody EmergencyContact contact) {
        return emergencyContactRepository.save(contact);
    }

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
