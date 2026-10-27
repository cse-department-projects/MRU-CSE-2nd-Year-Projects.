package com.disastermanagement.dao;

import com.disastermanagement.database.DatabaseUtil;
import com.disastermanagement.model.DisasterReport;
import com.disastermanagement.model.EmergencyAlert;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class EmergencyAlertDAO {

    public boolean createAlert(EmergencyAlert alert) {
        String sql = "INSERT INTO emergency_alerts (title, message, disaster_type, severity, is_active) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, alert.getTitle());
            ps.setString(2, alert.getMessage());
            ps.setString(3, alert.getDisasterType() != null ? alert.getDisasterType().name() : "FLOOD");
            ps.setString(4, alert.getSeverity() != null ? alert.getSeverity().name() : "HIGH");
            ps.setInt(5, alert.isActive() ? 1 : 0);

            int rows = ps.executeUpdate();
            if (rows > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) alert.setAlertId(rs.getInt(1));
                } catch (Exception ignored) {}
                return true;
            }
        } catch (SQLException e) {
            System.err.println("Error creating emergency alert: " + e.getMessage());
        }
        return false;
    }

    public List<EmergencyAlert> getActiveAlerts() {
        List<EmergencyAlert> list = new ArrayList<>();
        String sql = "SELECT * FROM emergency_alerts WHERE is_active != 0 ORDER BY alert_id DESC";
        try (Connection conn = DatabaseUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                list.add(mapRow(rs));
            }
        } catch (SQLException e) {
            System.err.println("Notice: Emergency alerts lookup fallback (" + e.getMessage() + ")");
        }
        return list;
    }

    public List<EmergencyAlert> getAllAlerts() {
        List<EmergencyAlert> list = new ArrayList<>();
        String sql = "SELECT * FROM emergency_alerts ORDER BY alert_id DESC";
        try (Connection conn = DatabaseUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                list.add(mapRow(rs));
            }
        } catch (SQLException e) {
            System.err.println("Notice: All alerts lookup fallback (" + e.getMessage() + ")");
        }
        return list;
    }

    public boolean updateAlertStatus(int alertId, boolean isActive) {
        String sql = "UPDATE emergency_alerts SET is_active = ? WHERE alert_id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, isActive ? 1 : 0);
            ps.setInt(2, alertId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error updating alert status: " + e.getMessage());
        }
        return false;
    }

    private EmergencyAlert mapRow(ResultSet rs) throws SQLException {
        EmergencyAlert alert = new EmergencyAlert();
        alert.setAlertId(rs.getInt("alert_id"));
        alert.setTitle(rs.getString("title"));
        alert.setMessage(rs.getString("message"));
        alert.setDisasterType(DisasterReport.DisasterType.fromString(rs.getString("disaster_type")));
        alert.setSeverity(DisasterReport.Severity.fromString(rs.getString("severity")));
        alert.setActive(rs.getInt("is_active") != 0);
        try { alert.setCreatedAt(rs.getTimestamp("created_at")); } catch (Exception ignored) {}
        return alert;
    }
}
