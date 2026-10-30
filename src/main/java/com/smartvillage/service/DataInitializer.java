package com.smartvillage.service;

import com.smartvillage.model.*;
import com.smartvillage.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private ServiceApplicationRepository serviceApplicationRepository;

    @Autowired
    private CropPriceRepository cropPriceRepository;

    @Autowired
    private SoilTestRequestRepository soilTestRequestRepository;

    @Autowired
    private UtilityScheduleRepository utilityScheduleRepository;

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private EmergencyContactRepository emergencyContactRepository;

    @Autowired
    private EmergencyAlertRepository emergencyAlertRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Override
    public void run(String... args) throws Exception {

        if (activityLogRepository.count() == 0) {
            activityLogRepository.save(new ActivityLog(
                "SYSTEM",
                "ADMIN",
                "SYSTEM_STARTUP",
                "Smart Village Management System successfully connected to MySQL database 'smart_village_db'.",
                "127.0.0.1",
                "SUCCESS"
            ));
        }

        // 1. Initial Users (Admin and Citizens)
        if (userRepository.count() == 0) {
            User admin = new User("admin", "admin123", "Rajesh Kumar (Gram Panchayat Admin)", "ADMIN", "admin@smartvillage.gov.in", "9876543210", "Ward 1");
            admin.setAadhaar("1234-5678-9012");
            admin.setRationCard("RC-ADM-001");
            admin.setOccupation("Panchayat Secretary");
            userRepository.save(admin);

            User citizen1 = new User("citizen", "citizen123", "Ramesh Verma", "CITIZEN", "ramesh@example.com", "9123456789", "Ward 3");
            citizen1.setAadhaar("9876-5432-1098");
            citizen1.setRationCard("RC-CIT-104");
            citizen1.setOccupation("Agriculture / Farmer");
            citizen1.setAddress("House No. 45, North Street, Ward 3, Smart Village");
            citizen1.setHouseholdMembers(4);
            userRepository.save(citizen1);

            User citizen2 = new User("sunita", "pass123", "Sunita Sharma", "CITIZEN", "sunita@example.com", "9887766554", "Ward 2");
            citizen2.setAadhaar("5544-3322-1100");
            citizen2.setRationCard("RC-CIT-209");
            citizen2.setOccupation("School Teacher");
            citizen2.setAddress("Plot 12, Main Road, Ward 2");
            citizen2.setHouseholdMembers(3);
            userRepository.save(citizen2);
        }

        // 2. Initial Crop Prices
        if (cropPriceRepository.count() == 0) {
            cropPriceRepository.save(new CropPrice("Paddy (Rice)", "CEREAL", new BigDecimal("2300.00"), new BigDecimal("2100.00"), new BigDecimal("2450.00"), "UP"));
            cropPriceRepository.save(new CropPrice("Wheat (Grade A)", "CEREAL", new BigDecimal("2275.00"), new BigDecimal("2150.00"), new BigDecimal("2350.00"), "STABLE"));
            cropPriceRepository.save(new CropPrice("Sugarcane", "CASH_CROP", new BigDecimal("315.00"), new BigDecimal("300.00"), new BigDecimal("325.00"), "UP"));
            cropPriceRepository.save(new CropPrice("Cotton (Medium Staple)", "CASH_CROP", new BigDecimal("6620.00"), new BigDecimal("6400.00"), new BigDecimal("6800.00"), "DOWN"));
            cropPriceRepository.save(new CropPrice("Yellow Mustard", "OILSEED", new BigDecimal("5650.00"), new BigDecimal("5400.00"), new BigDecimal("5800.00"), "UP"));
            cropPriceRepository.save(new CropPrice("Maize", "CEREAL", new BigDecimal("2090.00"), new BigDecimal("1950.00"), new BigDecimal("2150.00"), "STABLE"));
        }

        // 3. Initial Utility Schedules
        if (utilityScheduleRepository.count() == 0) {
            utilityScheduleRepository.save(new UtilitySchedule("WATER_SUPPLY", "Morning Water Supply Schedule", "Wards 1, 2, and 3", "Daily: 6:00 AM - 9:00 AM", "SCHEDULED", "Overhead tank pressure maintenance completed. Normal supply expected."));
            utilityScheduleRepository.save(new UtilitySchedule("POWER_OUTAGE", "Substation Maintenance Outage", "Wards 4 and 5", "Oct 05, 10:00 AM - 2:00 PM", "SCHEDULED", "Annual feeder line upgrade by State Electricity Board."));
            utilityScheduleRepository.save(new UtilitySchedule("WASTE_COLLECTION", "Door-to-Door Dry/Wet Waste Collection", "All Wards (1 to 6)", "Mon & Thu: 7:30 AM", "SCHEDULED", "Segregated waste collection vehicle route activated."));
            utilityScheduleRepository.save(new UtilitySchedule("STREET_MAINTENANCE", "LED Solar Streetlight Replacement", "Main Market Road", "Oct 08, 9:00 AM - 5:00 PM", "SCHEDULED", "Replacing 40 CFL streetlights with energy-efficient 50W Solar LEDs."));
        }

        // 4. Initial Announcements
        if (announcementRepository.count() == 0) {
            announcementRepository.save(new Announcement("Gram Sabha General Body Meeting", "GRAM_SABHA", "HIGH", "All citizens and village heads are invited to attend the quarterly Gram Sabha meeting at Panchayat Bhavan this Friday at 10:00 AM. Key agenda: Water conservation & road approval.", "ALL"));
            announcementRepository.save(new Announcement("Free Cattle Health & Vaccination Camp", "HEALTH", "NORMAL", "Veterinary Department organizing free livestock vaccination drive against Foot & Mouth Disease at the Village Veterinary Clinic.", "FARMERS"));
            announcementRepository.save(new Announcement("PM-Kisan 17th Installment KYC Update Deadline", "SCHEME", "HIGH", "Farmers who have not completed biometric e-KYC are requested to visit Common Service Center (CSC) before Oct 15th to receive payment.", "FARMERS"));
            announcementRepository.save(new Announcement("Senior Citizen Pension Verification Drive", "SCHEME", "NORMAL", "Annual life certificate submission camp for Old Age Pensioners will be held at Community Center on Wednesday.", "SENIOR_CITIZENS"));
        }

        // 5. Initial Emergency Contacts
        if (emergencyContactRepository.count() == 0) {
            emergencyContactRepository.save(new EmergencyContact("PANCHAYAT", "Shri Rameshwar Singh", "Gram Sarpanch", "9876500001", "9876500002", "sarpanch@smartvillage.gov.in", "Panchayat Office, Main Square"));
            emergencyContactRepository.save(new EmergencyContact("HEALTHCARE", "Primary Health Center (PHC)", "Medical Officer On Duty", "9876500003", "108", "phc@smartvillage.gov.in", "Village Health Center Road"));
            emergencyContactRepository.save(new EmergencyContact("POLICE", "Village Police Outpost", "Sub-Inspector Sharma", "9876500004", "112", "police@smartvillage.gov.in", "Near Highway Bus Stand"));
            emergencyContactRepository.save(new EmergencyContact("ELECTRICITY", "Substation Lineman Helpline", "Junior Engineer Electricity", "9876500005", "1912", "electricity@smartvillage.gov.in", "Power Substation Ward 4"));
            emergencyContactRepository.save(new EmergencyContact("WATER_BOARD", "Jal Jeevan Mission Supervisor", "Water Works Operator", "9876500006", "9876500007", "water@smartvillage.gov.in", "Water Pump House Ward 1"));
        }

        // 6. Initial Emergency Alert
        if (emergencyAlertRepository.count() == 0) {
            emergencyAlertRepository.save(new EmergencyAlert("Heavy Rain Alert & Canal Water Discharge Notice", "MODERATE", "Irritation department issued alert regarding heavy upstream rainfall. Stay cautious near canal banks. Flood control team on standby."));
        }

        // 7. Initial Complaints
        if (complaintRepository.count() == 0) {
            User citizen = userRepository.findByUsername("citizen").orElse(null);
            if (citizen != null) {
                Complaint c1 = new Complaint();
                c1.setTicketNo("TKT-2026-001");
                c1.setUser(citizen);
                c1.setTitle("Broken Streetlight Near Ward 3 Temple");
                c1.setCategory("Streetlights");
                c1.setDescription("The street light in front of the Durga Mata temple has been non-functional for the past 4 days, causing safety issues at night.");
                c1.setLocation("Near Durga Temple, Ward 3");
                c1.setWardNumber("Ward 3");
                c1.setPriority("MEDIUM");
                c1.setStatus("IN_PROGRESS");
                c1.setAssignedOfficer("Lineman Suresh");
                c1.setAdminRemarks("Inspection completed. Replacement LED lamp ordered.");
                complaintRepository.save(c1);

                Complaint c2 = new Complaint();
                c2.setTicketNo("TKT-2026-002");
                c2.setUser(citizen);
                c2.setTitle("Water Pipeline Leakage on North Street");
                c2.setCategory("Water");
                c2.setDescription("Main drinking water supply pipe is leaking near House #42, wasting clean water and causing mud accumulation.");
                c2.setLocation("North Street, Ward 3");
                c2.setWardNumber("Ward 3");
                c2.setPriority("HIGH");
                c2.setStatus("PENDING");
                complaintRepository.save(c2);
            }
        }

        // 8. Initial Service Applications
        if (serviceApplicationRepository.count() == 0) {
            User citizen = userRepository.findByUsername("citizen").orElse(null);
            if (citizen != null) {
                ServiceApplication sa1 = new ServiceApplication();
                sa1.setAppNumber("APP-2026-101");
                sa1.setUser(citizen);
                sa1.setServiceName("Solar Irrigation Pump Subsidy Scheme");
                sa1.setCategory("Agriculture Subsidy");
                sa1.setDescription("Application for 5HP PM-KUSUM Solar Agriculture Pump installation on Survey #142.");
                sa1.setStatus("UNDER_REVIEW");
                sa1.setRemarks("Land ownership documents verified by Patwari.");
                serviceApplicationRepository.save(sa1);
            }
        }
    }
}
