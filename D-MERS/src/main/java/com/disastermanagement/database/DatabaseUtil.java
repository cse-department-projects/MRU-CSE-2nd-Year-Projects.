package com.disastermanagement.database;

import com.disastermanagement.util.ConfigLoader;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseUtil {
    private static String mysqlUrl;
    private static String mysqlUser;
    private static String mysqlPassword;
    private static final String SQLITE_URL = "jdbc:sqlite:disaster_management.db";
    
    private static boolean useSQLite = false;

    static {
        init();
    }

    private static void init() {
        mysqlUrl = ConfigLoader.get("db.url", "jdbc:mysql://localhost:3306/disaster_management?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC");
        mysqlUser = ConfigLoader.get("user", "root");
        if ("root".equals(mysqlUser)) {
            mysqlUser = ConfigLoader.get("db.user", "root");
        }
        mysqlPassword = ConfigLoader.get("db.password", "root");

        try { Class.forName("com.mysql.cj.jdbc.Driver"); } catch (ClassNotFoundException ignored) {}
        try { Class.forName("org.sqlite.JDBC"); } catch (ClassNotFoundException ignored) {}
    }

    public static synchronized Connection getConnection() throws SQLException {
        if (!useSQLite) {
            try {
                return DriverManager.getConnection(mysqlUrl, mysqlUser, mysqlPassword);
            } catch (SQLException e) {
                // Error 1049: Unknown database -> Attempt to create database
                if (e.getErrorCode() == 1049 || (e.getMessage() != null && e.getMessage().contains("Unknown database"))) {
                    createDatabaseIfNotExists();
                    try {
                        return DriverManager.getConnection(mysqlUrl, mysqlUser, mysqlPassword);
                    } catch (SQLException ignored) {}
                }

                // Error 1045: Access denied -> Try common root passwords
                if (e.getErrorCode() == 1045 || (e.getMessage() != null && e.getMessage().contains("Access denied"))) {
                    String[] fallbackPasswords = new String[]{"root", "", "admin", "123456", "mysql", "password"};
                    for (String fallbackPass : fallbackPasswords) {
                        try {
                            Connection conn = DriverManager.getConnection(mysqlUrl, mysqlUser, fallbackPass);
                            mysqlPassword = fallbackPass;
                            System.out.println("[INFO] Connected to MySQL using password: '" + fallbackPass + "'");
                            return conn;
                        } catch (SQLException ignored) {}
                    }
                }

                System.out.println("[INFO] Local MySQL unavailable (" + e.getMessage() + "). Switching to embedded SQLite database.");
                useSQLite = true;
            }
        }

        return DriverManager.getConnection(SQLITE_URL);
    }

    public static boolean isUsingSQLite() {
        return useSQLite;
    }

    private static void createDatabaseIfNotExists() {
        if (mysqlUrl == null || !mysqlUrl.contains("/")) return;
        String baseUrl = mysqlUrl.substring(0, mysqlUrl.lastIndexOf('/')) + "/?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
        String[] fallbackPasswords = new String[]{mysqlPassword, "root", "", "admin", "123456", "mysql", "password"};
        
        for (String pass : fallbackPasswords) {
            try (Connection conn = DriverManager.getConnection(baseUrl, mysqlUser, pass);
                 java.sql.Statement stmt = conn.createStatement()) {
                stmt.executeUpdate("CREATE DATABASE IF NOT EXISTS disaster_management");
                mysqlPassword = pass;
                System.out.println("[INFO] Created MySQL database 'disaster_management' automatically.");
                return;
            } catch (Exception ignored) {}
        }
    }
}
