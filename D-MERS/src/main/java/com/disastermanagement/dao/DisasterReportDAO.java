package com.disastermanagement.dao;

import com.disastermanagement.database.DatabaseUtil;
import com.disastermanagement.model.DisasterReport;
import com.disastermanagement.smart.PriorityEngine;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class DisasterReportDAO {

    public boolean createReport(DisasterReport report) {
        // Calculate priority score automatically if not set
        if (report.getPriorityScore() <= 0) {
            PriorityEngine.PriorityResult res = PriorityEngine.calculateReportPriority(report);
            report.setPriorityScore(res.getScore());
        }

        String sql = "INSERT INTO disaster_reports (citizen_id, disaster_type, location, severity, description, affected_people, people_needing_help, priority_score, contact_number, status, image_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, report.getCitizenId());
            ps.setString(2, report.getDisasterTypeEnum() != null ? report.getDisasterTypeEnum().name() : "OTHER");
            ps.setString(3, report.getLocation());
            ps.setString(4, report.getSeverityEnum() != null ? report.getSeverityEnum().name() : "MEDIUM");
            ps.setString(5, report.getDescription());
            ps.setInt(6, report.getAffectedPeople());
            ps.setInt(7, report.getPeopleNeedingHelp());
            ps.setInt(8, report.getPriorityScore());
            ps.setString(9, report.getContactNumber());
            ps.setString(10, report.getStatusEnum() != null ? report.getStatusEnum().name() : "REPORTED");
            ps.setString(11, report.getImagePath());

            int rows = ps.executeUpdate();
            if (rows > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        report.setReportId(rs.getInt(1));
                    }
                } catch (Exception ignored) {}
                return true;
            }
        } catch (SQLException e) {
            System.err.println("Error creating disaster report: " + e.getMessage());
        }
        return false;
    }

    public List<DisasterReport> getAllReports() {
        List<DisasterReport> list = new ArrayList<>();
        String sql = "SELECT dr.*, u.full_name as citizen_name FROM disaster_reports dr LEFT JOIN users u ON dr.citizen_id = u.id ORDER BY dr.report_id DESC";
        try (Connection conn = DatabaseUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                list.add(mapRow(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error fetching disaster reports: " + e.getMessage());
        }
        return list;
    }

    public List<DisasterReport> getReportsByCitizen(int citizenId) {
        List<DisasterReport> list = new ArrayList<>();
        String sql = "SELECT dr.*, u.full_name as citizen_name FROM disaster_reports dr LEFT JOIN users u ON dr.citizen_id = u.id WHERE dr.citizen_id = ? ORDER BY dr.report_id DESC";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, citizenId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("Error fetching citizen reports: " + e.getMessage());
        }
        return list;
    }

    public boolean updateStatus(int reportId, DisasterReport.ReportStatus status) {
        String sql = "UPDATE disaster_reports SET status = ? WHERE report_id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status.name());
            ps.setInt(2, reportId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error updating report status: " + e.getMessage());
        }
        return false;
    }

    public boolean deleteReport(int reportId) {
        String sql = "DELETE FROM disaster_reports WHERE report_id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, reportId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error deleting report: " + e.getMessage());
        }
        return false;
    }

    public int getActiveDisastersCount() {
        String sql = "SELECT COUNT(*) FROM disaster_reports WHERE status IN ('REPORTED', 'VERIFIED', 'IN_ACTION')";
        try (Connection conn = DatabaseUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            System.err.println("Error fetching active disasters count: " + e.getMessage());
        }
        return 0;
    }

    private DisasterReport mapRow(ResultSet rs) throws SQLException {
        DisasterReport report = new DisasterReport();
        report.setReportId(rs.getInt("report_id"));
        report.setCitizenId(rs.getInt("citizen_id"));
        try { report.setCitizenName(rs.getString("citizen_name")); } catch (SQLException ignored) {}
        report.setDisasterType(DisasterReport.DisasterType.fromString(rs.getString("disaster_type")));
        report.setLocation(rs.getString("location"));
        report.setSeverity(DisasterReport.Severity.fromString(rs.getString("severity")));
        report.setDescription(rs.getString("description"));
        try { report.setAffectedPeople(rs.getInt("affected_people")); } catch (SQLException ignored) { report.setAffectedPeople(1); }
        try { report.setPeopleNeedingHelp(rs.getInt("people_needing_help")); } catch (SQLException ignored) { report.setPeopleNeedingHelp(1); }
        try { report.setPriorityScore(rs.getInt("priority_score")); } catch (SQLException ignored) { report.setPriorityScore(50); }
        try { report.setContactNumber(rs.getString("contact_number")); } catch (SQLException ignored) {}
        try { report.setReportDate(rs.getTimestamp("report_date")); } catch (Exception e) { report.setReportDate(new Timestamp(System.currentTimeMillis())); }
        report.setStatus(DisasterReport.ReportStatus.fromString(rs.getString("status")));
        report.setImagePath(rs.getString("image_path"));
        return report;
    }
}
