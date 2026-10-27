package com.disastermanagement.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Properties;

public class ConfigLoader {
    private static final Properties properties = new Properties();

    static {
        loadConfig();
    }

    private static void loadConfig() {
        try {
            // First check external config file
            File configFile = new File("config/db.properties");
            if (configFile.exists()) {
                try (InputStream is = new FileInputStream(configFile)) {
                    properties.load(is);
                    return;
                }
            }
            // Fallback to classpath
            try (InputStream is = ConfigLoader.class.getClassLoader().getResourceAsStream("db.properties")) {
                if (is != null) {
                    properties.load(is);
                }
            }
        } catch (Exception e) {
            System.err.println("Warning: Failed to load db.properties: " + e.getMessage());
        }
    }

    public static String get(String key, String defaultValue) {
        return properties.getProperty(key, defaultValue);
    }
}
