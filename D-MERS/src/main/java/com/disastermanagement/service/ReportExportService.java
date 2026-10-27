package com.disastermanagement.service;

import com.disastermanagement.dao.*;
import com.disastermanagement.model.*;

import java.io.File;
import java.io.FileWriter;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

public class ReportExportService {

    public static File exportSummaryReport() throws Exception {
        String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        File exportDir = new File("exports");
        if (!exportDir.exists()) exportDir.mkdirs();

        File file = new File(exportDir, "Disaster_Management_Report_" + timestamp + ".csv");
        try (PrintWriter writer = new PrintWriter(new FileWriter(file))) {
            writer.println("==================================================================");
            writer.println("DISASTER MANAGEMENT AND EMERGENCY RESPONSE SYSTEM - SUMMARY REPORT");
            writer.println("Generated Date: " + new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
            writer.println("==================================================================");
            writer.println();

            // Statistics Summary
            UserDAO userDAO = new UserDAO();
            DisasterReportDAO disasterDAO = new DisasterReportDAO();
            RescueRequestDAO rescueDAO = new RescueRequestDAO();
            ShelterDAO shelterDAO = new ShelterDAO();
            VolunteerDAO volunteerDAO = new VolunteerDAO();

            writer.println("KEY STATISTICS");
            writer.println("Total Users," + userDAO.getTotalUsersCount());
            writer.println("Active Disasters," + disasterDAO.getActiveDisastersCount());
            writer.println("Pending Rescues," + rescueDAO.getPendingCount());
            writer.println("Completed Rescues," + rescueDAO.getCompletedCount());
            writer.println("Available Shelters," + shelterDAO.getAvailableSheltersCount());
            writer.println("Registered Volunteers," + volunteerDAO.getVolunteerCount());
            writer.println();

            // Disaster Reports Section
            writer.println("--- DISASTER REPORTS ---");
            writer.println("ID,Citizen,Disaster Type,Location,Severity,Status,Date");
            List<DisasterReport> disasters = disasterDAO.getAllReports();
            for (DisasterReport d : disasters) {
                writer.printf("%d,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                        d.getReportId(),
                        d.getCitizenName() != null ? d.getCitizenName() : "Citizen #" + d.getCitizenId(),
                        d.getDisasterType(),
                        d.getLocation().replace("\"", "\"\""),
                        d.getSeverity(),
                        d.getStatus(),
                        d.getReportDate() != null ? d.getReportDate().toString() : "");
            }
            writer.println();

            // Rescue Requests Section
            writer.println("--- RESCUE REQUESTS ---");
            writer.println("ID,Citizen,Contact,Location,Emergency Type,People,Priority,Status,Assigned Team");
            List<RescueRequest> rescues = rescueDAO.getAllRequestsSortedByPriority();
            for (RescueRequest r : rescues) {
                writer.printf("%d,\"%s\",\"%s\",\"%s\",\"%s\",%d,\"%s\",\"%s\",\"%s\"%n",
                        r.getRequestId(),
                        r.getCitizenName() != null ? r.getCitizenName() : "Citizen #" + r.getCitizenId(),
                        r.getContactNumber(),
                        r.getLocation().replace("\"", "\"\""),
                        r.getEmergencyType(),
                        r.getNumPeople(),
                        r.getPriority().name(),
                        r.getStatus().name(),
                        r.getAssignedTeamName() != null ? r.getAssignedTeamName() : "Unassigned");
            }
            writer.println();

            // Shelters Section
            writer.println("--- SHELTERS ---");
            writer.println("ID,Name,Location,Capacity,Occupancy,Available Spaces,Status,Food,Water,Medical");
            List<Shelter> shelters = shelterDAO.getAllShelters();
            for (Shelter s : shelters) {
                writer.printf("%d,\"%s\",\"%s\",%d,%d,%d,\"%s\",%b,%b,%b%n",
                        s.getShelterId(),
                        s.getName().replace("\"", "\"\""),
                        s.getLocation().replace("\"", "\"\""),
                        s.getCapacity(),
                        s.getCurrentOccupancy(),
                        s.getAvailableSpaces(),
                        s.getOccupancyStatus(),
                        s.isFoodAvailable(),
                        s.isWaterAvailable(),
                        s.isMedicalFacility());
            }
        }
        return file;
    }
}
