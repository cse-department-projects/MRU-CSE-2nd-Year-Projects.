package com.disastermanagement.dao;

import com.disastermanagement.database.DatabaseUtil;
import com.disastermanagement.model.EmergencyTimeline;
import com.disastermanagement.model.RescueRequest;
import com.disastermanagement.smart.PriorityEngine;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class RescueRequestDAO {

    private final EmergencyTimelineDAO timelineDAO = new EmergencyTimelineDAO();

    public boolean createRequest(RescueRequest request) {
        // Calculate priority score using PriorityEngine if score not set
        if (request.getPriorityScore() <= 0) {
            PriorityEngine.PriorityResult res = PriorityEngine.calculatePriority(
                    request.getPriority() != null ? request.getPriority().name() : "MEDIUM",
                    request.getNumPeople(),
                    request.getNumPeople(),
                    request.getEmergencyType(),
                    request.isMedicalAssistanceRequired(),
                    request.getCreatedAtLocalDateTime()
            );
            request.setPriorityScore(res.getScore());
            request.setPriority(RescueRequest.RequestPriority.fromString(res.getLevel()));
        }

        String sql = "INSERT INTO rescue_requests (citizen_id, disaster_report_id, contact_number, location, emergency_type, num_people, description, medical_required, priority_score, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, request.getCitizenId());
            if (request.getDisasterReportId() > 0) ps.setInt(2, request.getDisasterReportId());
            else ps.setNull(2, Types.INTEGER);
            ps.setString(3, request.getContactNumber());
            ps.setString(4, request.getLocation());
            ps.setString(5, request.getEmergencyType());
            ps.setInt(6, request.getNumPeople());
            ps.setString(7, request.getDescription());
            ps.setBoolean(8, request.isMedicalAssistanceRequired());
            ps.setInt(9, request.getPriorityScore());
            ps.setString(10, request.getPriority() != null ? request.getPriority().name() : "MEDIUM");
            ps.setString(11, request.getStatus() != null ? request.getStatus().name() : "PENDING");

            int rows = ps.executeUpdate();
            if (rows > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        request.setRequestId(rs.getInt(1));
                    }
                } catch (Exception ignored) {}

                // Log initial events in Emergency Timeline
                timelineDAO.addEvent(new EmergencyTimeline(
                        request.getRequestId(),
                        "CREATED",
                        "Rescue request created for " + request.getNumPeople() + " people at " + request.getLocation(),
                        "Citizen"
                ));
                timelineDAO.addEvent(new EmergencyTimeline(
                        request.getRequestId(),
                        "PRIORITY_CALCULATED",
                        "Smart Rescue Priority Engine computed score: " + request.getPriorityScore() + "/100 (" + request.getPriority() + ")",
                        "System Priority Engine"
                ));

                return true;
            }
        } catch (SQLException e) {
            System.err.println("Error creating rescue request: " + e.getMessage());
        }
        return false;
    }

    public List<RescueRequest> getAllRequestsSortedByPriority() {
        List<RescueRequest> list = new ArrayList<>();
        String sql = "SELECT rr.*, u.full_name as citizen_name, rt.team_name as assigned_team_name " +
                     "FROM rescue_requests rr " +
                     "LEFT JOIN users u ON rr.citizen_id = u.id " +
                     "LEFT JOIN rescue_teams rt ON rr.assigned_team_id = rt.team_id " +
                     "ORDER BY rr.priority_score DESC, rr.created_at DESC";
        try (Connection conn = DatabaseUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                list.add(mapRow(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error fetching rescue requests: " + e.getMessage());
        }
        return list;
    }

    public List<RescueRequest> getRequestsByCitizen(int citizenId) {
        List<RescueRequest> list = new ArrayList<>();
        String sql = "SELECT rr.*, u.full_name as citizen_name, rt.team_name as assigned_team_name " +
                     "FROM rescue_requests rr " +
                     "LEFT JOIN users u ON rr.citizen_id = u.id " +
                     "LEFT JOIN rescue_teams rt ON rr.assigned_team_id = rt.team_id " +
                     "WHERE rr.citizen_id = ? " +
                     "ORDER BY rr.request_id DESC";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, citizenId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("Error fetching citizen rescue requests: " + e.getMessage());
        }
        return list;
    }

    public List<RescueRequest> getRequestsByTeam(int teamId) {
        List<RescueRequest> list = new ArrayList<>();
        String sql = "SELECT rr.*, u.full_name as citizen_name, rt.team_name as assigned_team_name " +
                     "FROM rescue_requests rr " +
                     "LEFT JOIN users u ON rr.citizen_id = u.id " +
                     "LEFT JOIN rescue_teams rt ON rr.assigned_team_id = rt.team_id " +
                     "WHERE rr.assigned_team_id = ? OR (rr.status = 'PENDING' AND rr.assigned_team_id IS NULL) " +
                     "ORDER BY rr.priority_score DESC, rr.created_at DESC";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, teamId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("Error fetching team rescue requests: " + e.getMessage());
        }
        return list;
    }

    public boolean updateStatusAndTeam(int requestId, RescueRequest.RequestStatus status, Integer teamId, String updatedBy, String notes) {
        String sql = "UPDATE rescue_requests SET status = ?, assigned_team_id = ?, updated_at = CURRENT_TIMESTAMP WHERE request_id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status.name());
            if (teamId != null) ps.setInt(2, teamId);
            else ps.setNull(2, Types.INTEGER);
            ps.setInt(3, requestId);

            boolean updated = ps.executeUpdate() > 0;
            if (updated) {
                String eventType = status.name();
                String desc = "Status updated to " + status.name() + (notes != null && !notes.isEmpty() ? ": " + notes : "");
                timelineDAO.addEvent(new EmergencyTimeline(requestId, eventType, desc, updatedBy != null ? updatedBy : "Rescue System"));
            }
            return updated;
        } catch (SQLException e) {
            System.err.println("Error updating rescue status: " + e.getMessage());
        }
        return false;
    }

    public boolean updatePriority(int requestId, RescueRequest.RequestPriority priority) {
        String sql = "UPDATE rescue_requests SET priority = ? WHERE request_id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, priority.name());
            ps.setInt(2, requestId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error updating priority: " + e.getMessage());
        }
        return false;
    }

    public int getPendingCount() {
        String sql = "SELECT COUNT(*) FROM rescue_requests WHERE status = 'PENDING'";
        try (Connection conn = DatabaseUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            System.err.println("Error getting pending count: " + e.getMessage());
        }
        return 0;
    }

    public int getCompletedCount() {
        String sql = "SELECT COUNT(*) FROM rescue_requests WHERE status = 'COMPLETED'";
        try (Connection conn = DatabaseUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            System.err.println("Error getting completed count: " + e.getMessage());
        }
        return 0;
    }

    private RescueRequest mapRow(ResultSet rs) throws SQLException {
        RescueRequest req = new RescueRequest();
        req.setRequestId(rs.getInt("request_id"));
        req.setCitizenId(rs.getInt("citizen_id"));
        try { req.setDisasterReportId(rs.getInt("disaster_report_id")); } catch (SQLException ignored) {}
        try { req.setCitizenName(rs.getString("citizen_name")); } catch (SQLException ignored) {}
        req.setContactNumber(rs.getString("contact_number"));
        req.setLocation(rs.getString("location"));
        req.setEmergencyType(rs.getString("emergency_type"));
        req.setNumPeople(rs.getInt("num_people"));
        req.setDescription(rs.getString("description"));
        try { req.setMedicalAssistanceRequired(rs.getBoolean("medical_required")); } catch (SQLException ignored) {}
        try { req.setPriorityScore(rs.getInt("priority_score")); } catch (SQLException ignored) { req.setPriorityScore(50); }
        req.setPriority(RescueRequest.RequestPriority.fromString(rs.getString("priority")));
        req.setStatus(RescueRequest.RequestStatus.fromString(rs.getString("status")));
        int teamId = rs.getInt("assigned_team_id");
        if (!rs.wasNull()) {
            req.setAssignedTeamId(teamId);
        }
        try { req.setAssignedTeamName(rs.getString("assigned_team_name")); } catch (SQLException ignored) {}
        try { req.setCreatedAt(rs.getTimestamp("created_at")); } catch (Exception ignored) {}
        try { req.setUpdatedAt(rs.getTimestamp("updated_at")); } catch (Exception ignored) {}
        return req;
    }
}
