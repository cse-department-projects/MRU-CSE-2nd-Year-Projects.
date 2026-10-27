package com.disastermanagement.dao;

import com.disastermanagement.database.DatabaseUtil;
import com.disastermanagement.model.EmergencyContact;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class EmergencyContactDAO {

    public List<EmergencyContact> getAllContacts() {
        List<EmergencyContact> list = new ArrayList<>();
        String sql = "SELECT * FROM emergency_contacts ORDER BY category ASC, title ASC";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                EmergencyContact ec = new EmergencyContact();
                ec.setId(rs.getInt("id"));
                ec.setCategory(rs.getString("category"));
                ec.setTitle(rs.getString("title"));
                ec.setPhoneNumber(rs.getString("phone_number"));
                ec.setLocation(rs.getString("location"));
                ec.setNotes(rs.getString("notes"));
                ec.setOfficial(rs.getBoolean("is_official"));
                list.add(ec);
            }
        } catch (SQLException e) {
            System.err.println("Error reading emergency contacts: " + e.getMessage());
        }
        return list;
    }

    public boolean addContact(EmergencyContact ec) {
        String sql = "INSERT INTO emergency_contacts (category, title, phone_number, location, notes, is_official) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, ec.getCategory());
            stmt.setString(2, ec.getTitle());
            stmt.setString(3, ec.getPhoneNumber());
            stmt.setString(4, ec.getLocation());
            stmt.setString(5, ec.getNotes());
            stmt.setBoolean(6, ec.isOfficial());
            int affected = stmt.executeUpdate();
            if (affected > 0) {
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) ec.setId(rs.getInt(1));
                }
                return true;
            }
        } catch (SQLException e) {
            System.err.println("Error adding emergency contact: " + e.getMessage());
        }
        return false;
    }

    public boolean updateContact(EmergencyContact ec) {
        String sql = "UPDATE emergency_contacts SET category = ?, title = ?, phone_number = ?, location = ?, notes = ?, is_official = ? WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, ec.getCategory());
            stmt.setString(2, ec.getTitle());
            stmt.setString(3, ec.getPhoneNumber());
            stmt.setString(4, ec.getLocation());
            stmt.setString(5, ec.getNotes());
            stmt.setBoolean(6, ec.isOfficial());
            stmt.setInt(7, ec.getId());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error updating contact: " + e.getMessage());
        }
        return false;
    }

    public boolean deleteContact(int id) {
        String sql = "DELETE FROM emergency_contacts WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error deleting contact: " + e.getMessage());
        }
        return false;
    }
}
