package com.disastermanagement.auth;

import com.disastermanagement.util.ConfigLoader;

import java.awt.Desktop;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class SupabaseClient {

    private static String supabaseUrl;
    private static String supabaseAnonKey;
    private static final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    static {
        init();
    }

    public static void init() {
        supabaseUrl = System.getenv("SUPABASE_URL");
        if (supabaseUrl == null || supabaseUrl.trim().isEmpty()) {
            supabaseUrl = ConfigLoader.get("supabase.url", "https://your-project.supabase.co");
        }

        supabaseAnonKey = System.getenv("SUPABASE_ANON_KEY");
        if (supabaseAnonKey == null || supabaseAnonKey.trim().isEmpty()) {
            supabaseAnonKey = ConfigLoader.get("supabase.anon_key", "your-anon-key-placeholder");
        }
    }

    public static boolean isConfigured() {
        return supabaseUrl != null && !supabaseUrl.contains("your-project") &&
                supabaseAnonKey != null && !supabaseAnonKey.contains("your-anon-key");
    }

    public static String getSupabaseUrl() {
        return supabaseUrl;
    }

    public static String getSupabaseAnonKey() {
        return supabaseAnonKey;
    }

    /**
     * Launch Google OAuth flow in standard system web browser.
     */
    public static boolean launchGoogleOAuth() {
        try {
            String targetUrl;
            if (isConfigured()) {
                targetUrl = supabaseUrl.replaceAll("/+$", "") + "/auth/v1/authorize?provider=google";
            } else {
                // Helpful demo link
                targetUrl = "https://supabase.com/docs/guides/auth/social-login/auth-google";
            }
            if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                Desktop.getDesktop().browse(new URI(targetUrl));
                return true;
            }
        } catch (Exception e) {
            System.err.println("[WARN] Unable to launch Google OAuth URL in browser: " + e.getMessage());
        }
        return false;
    }

    /**
     * Authenticate email/password via Supabase Auth REST API
     */
    public static String authenticateSupabaseUser(String email, String password) {
        if (!isConfigured()) return null;
        try {
            String endpoint = supabaseUrl.replaceAll("/+$", "") + "/auth/v1/token?grant_type=password";
            String jsonPayload = String.format("{\"email\":\"%s\",\"password\":\"%s\"}", email, password);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Content-Type", "application/json")
                    .header("apikey", supabaseAnonKey)
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                return response.body(); // Returns JSON containing access_token, user object
            }
        } catch (Exception e) {
            System.err.println("[WARN] Supabase Auth request failed: " + e.getMessage());
        }
        return null;
    }
}
