package com.disastermanagement.dao;

import com.disastermanagement.database.DatabaseUtil;
import com.disastermanagement.model.EmergencyTimeline;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class EmergencyTimelineDAO {

    public boolean addEvent(EmergencyTimeline event) {
        String sql = "INSERT INTO emergency_timeline (rescue_request_id, event_type, description, created_by, created_at) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, event.getRescueRequestId());
            stmt.setString(2, event.getEventType());
            stmt.setString(3, event.getDescription());
            stmt.setString(4, event.getCreatedBy());
            stmt.setTimestamp(5, Timestamp.valueOf(event.getCreatedAt()));
            int affected = stmt.executeUpdate();
            if (affected > 0) {
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) event.setId(rs.getInt(1));
                }
                return true;
            }
        } catch (SQLException e) {
            System.err.println("Error adding emergency timeline event: " + e.getMessage());
        }
        return false;
    }

    public List<EmergencyTimeline> getTimelineForRequest(int rescueRequestId) {
        List<EmergencyTimeline> list = new ArrayList<>();
        String sql = "SELECT * FROM emergency_timeline WHERE rescue_request_id = ? ORDER BY created_at ASC";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, rescueRequestId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    EmergencyTimeline et = new EmergencyTimeline();
                    et.setId(rs.getInt("id"));
                    et.setRescueRequestId(rs.getInt("rescue_request_id"));
                    et.setEventType(rs.getString("event_type"));
                    et.setDescription(rs.getString("description"));
                    et.setCreatedBy(rs.getString("created_by"));
                    Timestamp ts = rs.getTimestamp("created_at");
                    if (ts != null) et.setCreatedAt(ts.toLocalDateTime());
                    list.add(et);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error getting timeline: " + e.getMessage());
        }
        return list;
    }
}
