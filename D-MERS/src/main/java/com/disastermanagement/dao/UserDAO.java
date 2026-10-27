package com.disastermanagement.dao;

import com.disastermanagement.database.DatabaseUtil;
import com.disastermanagement.model.User;
import com.disastermanagement.model.UserRole;
import com.disastermanagement.util.PasswordUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class UserDAO {
    private static final List<User> memoryUsers = new ArrayList<>();

    static {
        String salt = "DMES_SALT_2026";
        User admin = new User(1, "admin", PasswordUtil.hashPassword("admin123", salt), salt, "System Administrator", "admin@demo.com", "9876543210", UserRole.ADMIN, new Timestamp(System.currentTimeMillis()));
        admin.setLocation("Emergency HQ");

        User citizen = new User(2, "citizen", PasswordUtil.hashPassword("citizen123", salt), salt, "John Doe (Citizen)", "citizen@demo.com", "9876543211", UserRole.CITIZEN, new Timestamp(System.currentTimeMillis()));
        citizen.setLocation("Riverbank Sector 4");

        User rescue = new User(3, "rescue", PasswordUtil.hashPassword("rescue123", salt), salt, "Captain Alex Mercer", "rescue@demo.com", "9876543212", UserRole.RESCUE_TEAM, new Timestamp(System.currentTimeMillis()));
        rescue.setLocation("NDRF Base Station");

        User volunteer = new User(4, "volunteer", PasswordUtil.hashPassword("volunteer123", salt), salt, "Sarah Jenkins", "volunteer@demo.com", "9876543213", UserRole.VOLUNTEER, new Timestamp(System.currentTimeMillis()));
        volunteer.setLocation("Community Relief Center");

        memoryUsers.add(admin);
        memoryUsers.add(citizen);
        memoryUsers.add(rescue);
        memoryUsers.add(volunteer);
    }

    public User findByUsername(String username) {
        if (username == null) return null;
        String sql = "SELECT * FROM users WHERE username = ? OR email = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, username.trim());
            ps.setString(2, username.trim());
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToUser(rs);
                }
            }
        } catch (Exception e) {
            System.err.println("[WARN] DB lookup failed: " + e.getMessage() + ". Using fallback memory store.");
        }
        for (User u : memoryUsers) {
            if (u.getUsername().equalsIgnoreCase(username.trim()) || u.getEmail().equalsIgnoreCase(username.trim())) {
                return u;
            }
        }
        return null;
    }

    public User findByEmail(String email) {
        if (email == null) return null;
        String sql = "SELECT * FROM users WHERE email = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email.trim());
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToUser(rs);
                }
            }
        } catch (Exception e) {
            System.err.println("[WARN] DB email lookup failed: " + e.getMessage());
        }
        for (User u : memoryUsers) {
            if (u.getEmail().equalsIgnoreCase(email.trim())) {
                return u;
            }
        }
        return null;
    }

    public User findById(int id) {
        String sql = "SELECT * FROM users WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToUser(rs);
                }
            }
        } catch (Exception e) {
            for (User u : memoryUsers) {
                if (u.getId() == id) return u;
            }
        }
        return null;
    }

    public boolean createUser(User user) {
        String sql = "INSERT INTO users (username, password_hash, salt, full_name, email, phone, location, profile_image, role, profile_complete) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, user.getUsername());
            ps.setString(2, user.getPasswordHash());
            ps.setString(3, user.getSalt());
            ps.setString(4, user.getFullName());
            ps.setString(5, user.getEmail());
            ps.setString(6, user.getPhone());
            ps.setString(7, user.getLocation());
            ps.setString(8, user.getProfileImage());
            ps.setString(9, user.getRole().name());
            ps.setBoolean(10, user.isProfileComplete());

            int rows = ps.executeUpdate();
            if (rows > 0) {
                try (ResultSet generatedKeys = ps.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        user.setId(generatedKeys.getInt(1));
                    }
                }
                memoryUsers.add(user);
                return true;
            }
        } catch (Exception e) {
            user.setId(memoryUsers.size() + 1);
            memoryUsers.add(user);
            return true;
        }
        return false;
    }

    public boolean updateUser(User user) {
        String sql = "UPDATE users SET full_name = ?, email = ?, phone = ?, location = ?, profile_image = ?, role = ?, profile_complete = ? WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, user.getFullName());
            ps.setString(2, user.getEmail());
            ps.setString(3, user.getPhone());
            ps.setString(4, user.getLocation());
            ps.setString(5, user.getProfileImage());
            ps.setString(6, user.getRole().name());
            ps.setBoolean(7, user.isProfileComplete());
            ps.setInt(8, user.getId());
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            for (int i = 0; i < memoryUsers.size(); i++) {
                if (memoryUsers.get(i).getId() == user.getId()) {
                    memoryUsers.set(i, user);
                    return true;
                }
            }
        }
        return false;
    }

    public boolean deleteUser(int id) {
        String sql = "DELETE FROM users WHERE id = ?";
        try (Connection conn = DatabaseUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            ps.executeUpdate();
        } catch (Exception ignored) {}
        return memoryUsers.removeIf(u -> u.getId() == id);
    }

    public List<User> getAllUsers() {
        List<User> list = new ArrayList<>();
        String sql = "SELECT * FROM users ORDER BY id DESC";
        try (Connection conn = DatabaseUtil.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                list.add(mapRowToUser(rs));
            }
            if (!list.isEmpty()) return list;
        } catch (Exception ignored) {}
        return new ArrayList<>(memoryUsers);
    }

    public int getTotalUsersCount() {
        return getAllUsers().size();
    }

    private User mapRowToUser(ResultSet rs) throws SQLException {
        User user = new User();
        user.setId(rs.getInt("id"));
        user.setUsername(rs.getString("username"));
        user.setPasswordHash(rs.getString("password_hash"));
        user.setSalt(rs.getString("salt"));
        user.setFullName(rs.getString("full_name"));
        user.setEmail(rs.getString("email"));
        user.setPhone(rs.getString("phone"));
        try { user.setLocation(rs.getString("location")); } catch (Exception ignored) {}
        try { user.setProfileImage(rs.getString("profile_image")); } catch (Exception ignored) {}
        try { user.setProfileComplete(rs.getBoolean("profile_complete")); } catch (Exception ignored) { user.setProfileComplete(true); }
        user.setRole(UserRole.fromString(rs.getString("role")));
        user.setCreatedAt(rs.getTimestamp("created_at"));
        return user;
    }
}
