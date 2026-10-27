package com.disastermanagement.dao;

import com.disastermanagement.database.DatabaseUtil;
import com.disastermanagement.model.Volunteer;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class VolunteerDAO {

    public Volunteer findByUserId(int userId) {
        String sql = "SELECT v.*, u.full_name FROM volunteers v JOIN users u ON v.user_id = u.id WHERE v.user_id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<Volunteer> getAllVolunteers() {
        List<Volunteer> list = new ArrayList<>();
        String sql = "SELECT v.*, u.full_name FROM volunteers v JOIN users u ON v.user_id = u.id ORDER BY v.volunteer_id DESC";
        try (Connection conn = DatabaseUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                list.add(mapRow(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public boolean createOrUpdateVolunteer(Volunteer v) {
        if (findByUserId(v.getUserId()) != null) {
            String sql = "UPDATE volunteers SET phone = ?, email = ?, skill = ?, availability = ?, location = ? WHERE user_id = ?";
            try (Connection conn = DatabaseUtil.getConnection();
                 PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setString(1, v.getPhone());
                ps.setString(2, v.getEmail());
                ps.setString(3, v.getSkill().name());
                ps.setString(4, v.getAvailability().name());
                ps.setString(5, v.getLocation());
                ps.setInt(6, v.getUserId());
                return ps.executeUpdate() > 0;
            } catch (SQLException e) {
                e.printStackTrace();
            }
        } else {
            String sql = "INSERT INTO volunteers (user_id, phone, email, skill, availability, location) VALUES (?, ?, ?, ?, ?, ?)";
            try (Connection conn = DatabaseUtil.getConnection();
                 PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setInt(1, v.getUserId());
                ps.setString(2, v.getPhone());
                ps.setString(3, v.getEmail());
                ps.setString(4, v.getSkill().name());
                ps.setString(5, v.getAvailability().name());
                ps.setString(6, v.getLocation());
                int rows = ps.executeUpdate();
                if (rows > 0) {
                    try (ResultSet rs = ps.getGeneratedKeys()) {
                        if (rs.next()) v.setVolunteerId(rs.getInt(1));
                    }
                    return true;
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        return false;
    }

    public int getVolunteerCount() {
        String sql = "SELECT COUNT(*) FROM volunteers";
        try (Connection conn = DatabaseUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }

    private Volunteer mapRow(ResultSet rs) throws SQLException {
        Volunteer v = new Volunteer();
        v.setVolunteerId(rs.getInt("volunteer_id"));
        v.setUserId(rs.getInt("user_id"));
        try { v.setFullName(rs.getString("full_name")); } catch (SQLException ignored) {}
        v.setPhone(rs.getString("phone"));
        v.setEmail(rs.getString("email"));
        v.setSkill(Volunteer.Skill.fromString(rs.getString("skill")));
        v.setAvailability(Volunteer.Availability.fromString(rs.getString("availability")));
        v.setLocation(rs.getString("location"));
        v.setActiveTasksCount(rs.getInt("active_tasks_count"));
        return v;
    }
}
