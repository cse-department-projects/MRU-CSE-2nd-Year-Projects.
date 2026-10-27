package com.disastermanagement.dao;

import com.disastermanagement.database.DatabaseUtil;
import com.disastermanagement.model.Volunteer;
import com.disastermanagement.model.VolunteerTask;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class VolunteerTaskDAO {

    public boolean createTask(VolunteerTask task) {
        String sql = "INSERT INTO volunteer_tasks (title, description, location, required_skill, disaster_report_id, status) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, task.getTitle());
            ps.setString(2, task.getDescription());
            ps.setString(3, task.getLocation());
            ps.setString(4, task.getRequiredSkill().name());
            if (task.getDisasterReportId() != null) ps.setInt(5, task.getDisasterReportId());
            else ps.setNull(5, Types.INTEGER);
            ps.setString(6, task.getStatus() != null ? task.getStatus().name() : "OPEN");

            int rows = ps.executeUpdate();
            if (rows > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) task.setTaskId(rs.getInt(1));
                }
                return true;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public List<VolunteerTask> getAllTasks() {
        List<VolunteerTask> list = new ArrayList<>();
        String sql = "SELECT vt.*, u.full_name as volunteer_name " +
                     "FROM volunteer_tasks vt " +
                     "LEFT JOIN volunteers v ON vt.assigned_volunteer_id = v.volunteer_id " +
                     "LEFT JOIN users u ON v.user_id = u.id " +
                     "ORDER BY vt.task_id DESC";
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

    public List<VolunteerTask> getOpenOrAssignedTasks(int volunteerId) {
        List<VolunteerTask> list = new ArrayList<>();
        String sql = "SELECT vt.*, u.full_name as volunteer_name " +
                     "FROM volunteer_tasks vt " +
                     "LEFT JOIN volunteers v ON vt.assigned_volunteer_id = v.volunteer_id " +
                     "LEFT JOIN users u ON v.user_id = u.id " +
                     "WHERE vt.status = 'OPEN' OR vt.assigned_volunteer_id = ? " +
                     "ORDER BY vt.task_id DESC";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, volunteerId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public boolean updateTaskStatus(int taskId, VolunteerTask.TaskStatus status, Integer volunteerId) {
        String sql = "UPDATE volunteer_tasks SET status = ?, assigned_volunteer_id = ? WHERE task_id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status.name());
            if (volunteerId != null) ps.setInt(2, volunteerId);
            else ps.setNull(2, Types.INTEGER);
            ps.setInt(3, taskId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private VolunteerTask mapRow(ResultSet rs) throws SQLException {
        VolunteerTask task = new VolunteerTask();
        task.setTaskId(rs.getInt("task_id"));
        task.setTitle(rs.getString("title"));
        task.setDescription(rs.getString("description"));
        task.setLocation(rs.getString("location"));
        task.setRequiredSkill(Volunteer.Skill.fromString(rs.getString("required_skill")));
        int rId = rs.getInt("disaster_report_id");
        if (!rs.wasNull()) task.setDisasterReportId(rId);
        int vId = rs.getInt("assigned_volunteer_id");
        if (!rs.wasNull()) task.setAssignedVolunteerId(vId);
        try { task.setAssignedVolunteerName(rs.getString("volunteer_name")); } catch (SQLException ignored) {}
        task.setStatus(VolunteerTask.TaskStatus.fromString(rs.getString("status")));
        task.setCreatedAt(rs.getTimestamp("created_at"));
        return task;
    }
}
