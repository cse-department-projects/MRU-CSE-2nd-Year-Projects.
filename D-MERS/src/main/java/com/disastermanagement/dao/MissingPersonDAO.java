package com.disastermanagement.dao;

import com.disastermanagement.database.DatabaseUtil;
import com.disastermanagement.model.MissingPerson;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class MissingPersonDAO {

    public boolean createReport(MissingPerson person) {
        String sql = "INSERT INTO missing_persons (reporter_id, name, age, gender, last_seen_location, date_last_seen, description, contact_info, photo_path, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, person.getReporterId());
            ps.setString(2, person.getName());
            ps.setInt(3, person.getAge());
            ps.setString(4, person.getGender().name());
            ps.setString(5, person.getLastSeenLocation());
            ps.setDate(6, person.getDateLastSeen());
            ps.setString(7, person.getDescription());
            ps.setString(8, person.getContactInfo());
            ps.setString(9, person.getPhotoPath());
            ps.setString(10, person.getStatus() != null ? person.getStatus().name() : "MISSING");

            int rows = ps.executeUpdate();
            if (rows > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) person.setPersonId(rs.getInt(1));
                }
                return true;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public List<MissingPerson> getAllReports() {
        List<MissingPerson> list = new ArrayList<>();
        String sql = "SELECT * FROM missing_persons ORDER BY person_id DESC";
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

    public boolean updateStatus(int personId, MissingPerson.PersonStatus status) {
        String sql = "UPDATE missing_persons SET status = ? WHERE person_id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status.name());
            ps.setInt(2, personId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private MissingPerson mapRow(ResultSet rs) throws SQLException {
        MissingPerson mp = new MissingPerson();
        mp.setPersonId(rs.getInt("person_id"));
        mp.setReporterId(rs.getInt("reporter_id"));
        mp.setName(rs.getString("name"));
        mp.setAge(rs.getInt("age"));
        mp.setGender(MissingPerson.Gender.fromString(rs.getString("gender")));
        mp.setLastSeenLocation(rs.getString("last_seen_location"));
        mp.setDateLastSeen(rs.getDate("date_last_seen"));
        mp.setDescription(rs.getString("description"));
        mp.setContactInfo(rs.getString("contact_info"));
        mp.setPhotoPath(rs.getString("photo_path"));
        mp.setStatus(MissingPerson.PersonStatus.fromString(rs.getString("status")));
        mp.setCreatedAt(rs.getTimestamp("created_at"));
        return mp;
    }
}
