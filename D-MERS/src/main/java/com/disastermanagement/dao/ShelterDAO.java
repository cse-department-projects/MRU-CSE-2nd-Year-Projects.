package com.disastermanagement.dao;

import com.disastermanagement.database.DatabaseUtil;
import com.disastermanagement.model.Shelter;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ShelterDAO {

    public boolean createShelter(Shelter shelter) {
        String sql = "INSERT INTO shelters (name, location, capacity, current_occupancy, food_available, water_available, medical_facility, contact_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, shelter.getName());
            ps.setString(2, shelter.getLocation());
            ps.setInt(3, shelter.getCapacity());
            ps.setInt(4, shelter.getCurrentOccupancy());
            ps.setBoolean(5, shelter.isFoodAvailable());
            ps.setBoolean(6, shelter.isWaterAvailable());
            ps.setBoolean(7, shelter.isMedicalFacility());
            ps.setString(8, shelter.getContactNumber());

            int rows = ps.executeUpdate();
            if (rows > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) shelter.setShelterId(rs.getInt(1));
                } catch (Exception ignored) {}
                return true;
            }
        } catch (SQLException e) {
            System.err.println("Error creating shelter: " + e.getMessage());
        }
        return false;
    }

    public List<Shelter> getAllShelters() {
        List<Shelter> list = new ArrayList<>();
        String sql = "SELECT * FROM shelters ORDER BY shelter_id DESC";
        try (Connection conn = DatabaseUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                list.add(mapRow(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error fetching shelters: " + e.getMessage());
        }
        return list;
    }

    public List<Shelter> filterShelters(String queryLocation, boolean requireFood, boolean requireWater, boolean requireMedical, boolean openOnly) {
        List<Shelter> all = getAllShelters();
        List<Shelter> filtered = new ArrayList<>();
        String locQuery = queryLocation != null ? queryLocation.trim().toLowerCase() : "";

        for (Shelter s : all) {
            if (!locQuery.isEmpty() && (s.getLocation() == null || !s.getLocation().toLowerCase().contains(locQuery) && !s.getName().toLowerCase().contains(locQuery))) {
                continue;
            }
            if (requireFood && !s.isFoodAvailable()) continue;
            if (requireWater && !s.isWaterAvailable()) continue;
            if (requireMedical && !s.isMedicalFacility()) continue;
            if (openOnly && s.getAvailableSpaces() <= 0) continue;

            filtered.add(s);
        }
        return filtered;
    }

    public boolean updateShelter(Shelter shelter) {
        String sql = "UPDATE shelters SET name = ?, location = ?, capacity = ?, current_occupancy = ?, food_available = ?, water_available = ?, medical_facility = ?, contact_number = ? WHERE shelter_id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, shelter.getName());
            ps.setString(2, shelter.getLocation());
            ps.setInt(3, shelter.getCapacity());
            ps.setInt(4, shelter.getCurrentOccupancy());
            ps.setBoolean(5, shelter.isFoodAvailable());
            ps.setBoolean(6, shelter.isWaterAvailable());
            ps.setBoolean(7, shelter.isMedicalFacility());
            ps.setString(8, shelter.getContactNumber());
            ps.setInt(9, shelter.getShelterId());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error updating shelter: " + e.getMessage());
        }
        return false;
    }

    public boolean deleteShelter(int shelterId) {
        String sql = "DELETE FROM shelters WHERE shelter_id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, shelterId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error deleting shelter: " + e.getMessage());
        }
        return false;
    }

    public int getAvailableSheltersCount() {
        String sql = "SELECT COUNT(*) FROM shelters WHERE current_occupancy < capacity";
        try (Connection conn = DatabaseUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            System.err.println("Error counting available shelters: " + e.getMessage());
        }
        return 0;
    }

    private Shelter mapRow(ResultSet rs) throws SQLException {
        Shelter s = new Shelter();
        s.setShelterId(rs.getInt("shelter_id"));
        s.setName(rs.getString("name"));
        s.setLocation(rs.getString("location"));
        s.setCapacity(rs.getInt("capacity"));
        s.setCurrentOccupancy(rs.getInt("current_occupancy"));
        try { s.setFoodAvailable(rs.getBoolean("food_available")); } catch (Exception ignored) {}
        try { s.setWaterAvailable(rs.getBoolean("water_available")); } catch (Exception ignored) {}
        try { s.setMedicalFacility(rs.getBoolean("medical_facility")); } catch (Exception ignored) {}
        s.setContactNumber(rs.getString("contact_number"));
        try { s.setCreatedAt(rs.getTimestamp("created_at")); } catch (Exception ignored) {}
        return s;
    }
}
