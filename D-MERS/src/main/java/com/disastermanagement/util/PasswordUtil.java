package com.disastermanagement.util;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

public class PasswordUtil {
    private static final String DEFAULT_SALT = "DMES_SALT_2026";

    public static String generateSalt() {
        byte[] salt = new byte[16];
        new SecureRandom().nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }

    public static String hashPassword(String password, String salt) {
        try {
            if (salt == null || salt.isEmpty()) {
                salt = DEFAULT_SALT;
            }
            String input = password + salt;
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] bytes = md.digest(input.getBytes("UTF-8"));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    public static boolean verifyPassword(String password, String storedHash, String salt) {
        if (password == null || storedHash == null) return false;

        // 1. Direct hash match with salt
        String hashWithSalt = hashPassword(password, salt);
        if (hashWithSalt.equalsIgnoreCase(storedHash)) return true;

        // 2. Direct hash match with default salt
        String hashWithDefaultSalt = hashPassword(password, DEFAULT_SALT);
        if (hashWithDefaultSalt.equalsIgnoreCase(storedHash)) return true;

        // 3. Fallback direct match for plain-text / demo passwords (e.g. admin123)
        if (password.trim().equals(storedHash.trim())) return true;

        // 4. Fallback legacy SHA-256 without salt
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] bytes = md.digest(password.getBytes("UTF-8"));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            if (sb.toString().equalsIgnoreCase(storedHash)) return true;
        } catch (Exception ignored) {}

        return false;
    }
}
