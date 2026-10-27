package com.disastermanagement.view;

import com.disastermanagement.auth.SupabaseClient;
import com.disastermanagement.dao.EmergencyAlertDAO;
import com.disastermanagement.model.EmergencyAlert;
import com.disastermanagement.util.UIUtils;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ScrollPane;
import javafx.scene.layout.*;
import javafx.stage.Stage;

import java.util.List;

public class LandingView {

    private final Stage stage;
    private final EmergencyAlertDAO alertDAO = new EmergencyAlertDAO();

    public LandingView(Stage stage) {
        this.stage = stage;
    }

    public void show() {
        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color: #F8FAFC;");

        // 1. HEADER BAR
        HBox navbar = new HBox(20);
        navbar.getStyleClass().add("header-bar");
        navbar.setAlignment(Pos.CENTER_LEFT);
        navbar.setPadding(new Insets(15, 40, 15, 40));

        Label logoLabel = new Label("🚨 D-MERS");
        logoLabel.setStyle("-fx-font-size: 22px; -fx-font-weight: 800; -fx-text-fill: #1E3A8A;");

        Label fullTitle = new Label("Disaster Management & Emergency Response System");
        fullTitle.setStyle("-fx-font-size: 13px; -fx-text-fill: #64748B; -fx-font-weight: 600;");

        VBox brandBox = new VBox(2, logoLabel, fullTitle);

        Region navSpacer = new Region();
        HBox.setHgrow(navSpacer, Priority.ALWAYS);

        Button homeBtn = new Button("Home");
        homeBtn.getStyleClass().addAll("button", "button-secondary");

        Button aboutBtn = new Button("About D-MERS");
        aboutBtn.getStyleClass().addAll("button", "button-secondary");
        aboutBtn.setOnAction(e -> showAboutModal());

        Button emergencyBtn = new Button("Emergency Contacts");
        emergencyBtn.getStyleClass().addAll("button", "button-warning");
        emergencyBtn.setOnAction(e -> showEmergencyContactsModal());

        Button loginBtn = new Button("Sign In / Register");
        loginBtn.getStyleClass().addAll("button", "button-primary");
        loginBtn.setOnAction(e -> new LoginView(stage).show());

        navbar.getChildren().addAll(brandBox, navSpacer, homeBtn, aboutBtn, emergencyBtn, loginBtn);
        root.setTop(navbar);

        // 2. MAIN SCROLL CONTENT
        VBox content = new VBox(35);
        content.setPadding(new Insets(30, 50, 50, 50));
        content.setAlignment(Pos.TOP_CENTER);

        // Active Emergency Alerts Banner
        List<EmergencyAlert> activeAlerts = alertDAO.getActiveAlerts();
        if (!activeAlerts.isEmpty()) {
            VBox alertBanner = new VBox(8);
            alertBanner.getStyleClass().add("alert-card-critical");
            alertBanner.setMaxWidth(1100);

            Label alertHeader = new Label("⚠️ ACTIVE EMERGENCY ALERTS (" + activeAlerts.size() + ")");
            alertHeader.setStyle("-fx-font-weight: 800; -fx-text-fill: #DC2626; -fx-font-size: 15px;");
            alertBanner.getChildren().add(alertHeader);

            for (EmergencyAlert alert : activeAlerts) {
                Label aText = new Label("• " + alert.getTitle() + ": " + alert.getMessage());
                aText.setStyle("-fx-font-size: 13px; -fx-text-fill: #991B1B; -fx-font-weight: 600;");
                aText.setWrapText(true);
                alertBanner.getChildren().add(aText);
            }
            content.getChildren().add(alertBanner);
        }

        // HERO SECTION
        VBox heroBox = new VBox(18);
        heroBox.setAlignment(Pos.CENTER);
        heroBox.setPadding(new Insets(40, 20, 40, 20));
        heroBox.setStyle("-fx-background-color: #FFFFFF; -fx-background-radius: 16px; -fx-border-color: #E2E8F0; -fx-border-radius: 16px; -fx-effect: dropshadow(three-pass-box, rgba(0,0,0,0.04), 10, 0, 0, 4);");
        heroBox.setMaxWidth(1100);

        Label heroBadge = new Label("NEXT-GENERATION EMERGENCY COORDINATION PLATFORM");
        heroBadge.getStyleClass().addAll("badge", "badge-info");
        heroBadge.setStyle("-fx-font-size: 12px; -fx-padding: 6px 14px;");

        Label headline = new Label("One Platform. Faster Response. Safer Communities.");
        headline.setStyle("-fx-font-size: 34px; -fx-font-weight: 900; -fx-text-fill: #0F172A; -fx-alignment: center;");
        headline.setWrapText(true);

        Label subtitle = new Label("D-MERS connects Citizens, Rescue Teams, Volunteers, and Administrators during floods, earthquakes, cyclones, fires, and landslides to eliminate communication delays and save lives.");
        subtitle.setStyle("-fx-font-size: 15px; -fx-text-fill: #475569; -fx-max-width: 800px; -fx-alignment: center;");
        subtitle.setWrapText(true);

        HBox heroActionButtons = new HBox(15);
        heroActionButtons.setAlignment(Pos.CENTER);

        Button reportNowBtn = new Button("🚨 Report Emergency Now");
        reportNowBtn.getStyleClass().addAll("button", "button-danger");
        reportNowBtn.setStyle("-fx-font-size: 15px; -fx-padding: 12px 24px;");
        reportNowBtn.setOnAction(e -> {
            UIUtils.showInformation("Quick Emergency Reporting", "Please sign in or continue as Citizen to submit your location and rescue request.");
            new LoginView(stage).show();
        });

        Button googleSignInBtn = new Button("🌐 Sign in with Google (Supabase Auth)");
        googleSignInBtn.getStyleClass().add("button-google");
        googleSignInBtn.setStyle("-fx-font-size: 14px; -fx-padding: 12px 20px;");
        googleSignInBtn.setOnAction(e -> {
            try {
                SupabaseClient.launchGoogleOAuth();
                UIUtils.showInformation("Google Authentication", "Opened Google OAuth in browser. Sign in using Google or click Login to proceed to profile setup.");
                new LoginView(stage).show();
            } catch (Exception ex) {
                UIUtils.showError("Google Auth Error", ex.getMessage());
            }
        });

        Button vivaFeaturesBtn = new Button("💡 Viva & Innovation Features");
        vivaFeaturesBtn.getStyleClass().addAll("button", "button-primary");
        vivaFeaturesBtn.setStyle("-fx-font-size: 14px; -fx-padding: 12px 20px;");
        vivaFeaturesBtn.setOnAction(e -> new InnovationFeaturesView(stage).show());

        heroActionButtons.getChildren().addAll(reportNowBtn, googleSignInBtn, vivaFeaturesBtn);
        heroBox.getChildren().addAll(heroBadge, headline, subtitle, heroActionButtons);
        content.getChildren().add(heroBox);

        // FEATURE CARDS GRID
        Label featuresTitle = new Label("Core Platform Capabilities");
        featuresTitle.getStyleClass().add("h1");

        GridPane grid = new GridPane();
        grid.setHgap(20);
        grid.setVgap(20);
        grid.setMaxWidth(1100);
        grid.setAlignment(Pos.CENTER);

        grid.add(createFeatureCard("🚨 Emergency Reporting", "Allows citizens to submit instant disaster reports with location, photos, hazard type, and affected count.", "#EF4444"), 0, 0);
        grid.add(createFeatureCard("⚡ Smart Rescue Priority", "Rule-based 0-100 algorithm prioritizing critical victims based on severity, vulnerability, and waiting time.", "#2563EB"), 1, 0);
        grid.add(createFeatureCard("🏠 Shelter Intelligence", "Visual green/yellow/red capacity tracking with available food, water, and medical facility filters.", "#059669"), 2, 0);

        grid.add(createFeatureCard("🤝 Volunteer Matching", "Matches volunteers to emergency tasks based on skill compatibility, availability status, and location proximity.", "#EA580C"), 0, 1);
        grid.add(createFeatureCard("🔔 Emergency Alerts", "Admin-published critical warning alerts broadcast live to all active user dashboards.", "#D97706"), 1, 1);
        grid.add(createFeatureCard("📊 Analytics & Timeline", "Chronological emergency history log for every operation + JavaFX charts for decision making.", "#7C3AED"), 2, 1);

        ColumnConstraints col = new ColumnConstraints();
        col.setPercentWidth(33.33);
        grid.getColumnConstraints().addAll(col, col, col);

        content.getChildren().addAll(featuresTitle, grid);

        ScrollPane scroll = new ScrollPane(content);
        scroll.setFitToWidth(true);
        scroll.setStyle("-fx-background: #F8FAFC; -fx-background-color: #F8FAFC;");
        root.setCenter(scroll);

        Scene scene = new Scene(root, 1200, 800);
        scene.getStylesheets().add(getClass().getResource("/css/styles.css").toExternalForm());
        stage.setTitle("D-MERS - Disaster Management and Emergency Response System");
        stage.setScene(scene);
        stage.show();
    }

    private VBox createFeatureCard(String title, String desc, String borderHex) {
        VBox card = new VBox(10);
        card.getStyleClass().add("card");
        card.setStyle("-fx-border-color: " + borderHex + "; -fx-border-width: 2px 1px 1px 1px;");

        Label tLabel = new Label(title);
        tLabel.setStyle("-fx-font-size: 16px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");

        Label dLabel = new Label(desc);
        dLabel.setStyle("-fx-font-size: 13px; -fx-text-fill: #64748B;");
        dLabel.setWrapText(true);

        card.getChildren().addAll(tLabel, dLabel);
        return card;
    }

    private void showAboutModal() {
        UIUtils.showInformation("About D-MERS",
                "Disaster Management and Emergency Response System (D-MERS)\n\n" +
                "Developed as an Application Development project for college presentation.\n" +
                "Architecture: Java 17+, JavaFX 21, Supabase (PostgreSQL & Auth REST), SQLite fallback.\n\n" +
                "Key Goal: Connecting Citizens, Rescue Teams, Volunteers, and Administrators to save lives during natural and human-made disasters.");
    }

    private void showEmergencyContactsModal() {
        UIUtils.showInformation("Emergency Helplines",
                "National Emergency Number: 112\n" +
                "Police: 100\n" +
                "Fire & Rescue: 101\n" +
                "Ambulance Service: 108 / 102\n" +
                "National Disaster Management Cell (NDRF): 011-24363260\n" +
                "Disaster Control Room: 1070");
    }
}
