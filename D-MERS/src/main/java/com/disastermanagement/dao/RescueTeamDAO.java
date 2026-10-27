package com.disastermanagement.dao;

import com.disastermanagement.database.DatabaseUtil;
import com.disastermanagement.model.RescueTeam;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class RescueTeamDAO {

    public RescueTeam findByUserId(int userId) {
        String sql = "SELECT * FROM rescue_teams WHERE user_id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error finding rescue team: " + e.getMessage());
        }
        return null;
    }

    public RescueTeam findById(int teamId) {
        String sql = "SELECT * FROM rescue_teams WHERE team_id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, teamId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error finding rescue team by ID: " + e.getMessage());
        }
        return null;
    }

    public List<RescueTeam> getAllTeams() {
        List<RescueTeam> list = new ArrayList<>();
        String sql = "SELECT * FROM rescue_teams ORDER BY team_id ASC";
        try (Connection conn = DatabaseUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                list.add(mapRow(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error fetching rescue teams: " + e.getMessage());
        }
        return list;
    }

    public boolean createTeam(RescueTeam team) {
        String sql = "INSERT INTO rescue_teams (user_id, team_name, leader_name, contact_number, specialization, active_status) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, team.getUserId());
            ps.setString(2, team.getTeamName());
            ps.setString(3, team.getLeaderName());
            ps.setString(4, team.getContactNumber());
            ps.setString(5, team.getSpecialization());
            ps.setString(6, team.getActiveStatus() != null ? team.getActiveStatus().name() : "AVAILABLE");
            int rows = ps.executeUpdate();
            if (rows > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) team.setTeamId(rs.getInt(1));
                }
                return true;
            }
        } catch (SQLException e) {
            System.err.println("Error creating rescue team: " + e.getMessage());
        }
        return false;
    }

    public boolean createOrUpdateTeam(RescueTeam team) {
        if (findByUserId(team.getUserId()) != null) {
            String sql = "UPDATE rescue_teams SET team_name = ?, leader_name = ?, contact_number = ?, specialization = ?, active_status = ? WHERE user_id = ?";
            try (Connection conn = DatabaseUtil.getConnection();
                 PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setString(1, team.getTeamName());
                ps.setString(2, team.getLeaderName());
                ps.setString(3, team.getContactNumber());
                ps.setString(4, team.getSpecialization());
                ps.setString(5, team.getActiveStatus() != null ? team.getActiveStatus().name() : "AVAILABLE");
                ps.setInt(6, team.getUserId());
                return ps.executeUpdate() > 0;
            } catch (SQLException e) {
                System.err.println("Error updating rescue team: " + e.getMessage());
            }
        } else {
            return createTeam(team);
        }
        return false;
    }

    public boolean updateStatus(int teamId, RescueTeam.TeamStatus status) {
        String sql = "UPDATE rescue_teams SET active_status = ? WHERE team_id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status.name());
            ps.setInt(2, teamId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error updating team status: " + e.getMessage());
        }
        return false;
    }

    private RescueTeam mapRow(ResultSet rs) throws SQLException {
        RescueTeam team = new RescueTeam();
        team.setTeamId(rs.getInt("team_id"));
        team.setUserId(rs.getInt("user_id"));
        team.setTeamName(rs.getString("team_name"));
        team.setLeaderName(rs.getString("leader_name"));
        team.setContactNumber(rs.getString("contact_number"));
        team.setSpecialization(rs.getString("specialization"));
        team.setActiveStatus(RescueTeam.TeamStatus.fromString(rs.getString("active_status")));
        return team;
    }
}
