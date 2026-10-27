package com.disastermanagement.view;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ScrollPane;
import javafx.scene.layout.*;
import javafx.stage.Stage;

public class InnovationFeaturesView {

    private final Stage stage;

    public InnovationFeaturesView(Stage stage) {
        this.stage = stage;
    }

    public void show() {
        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color: #F8FAFC;");

        // Header
        HBox header = new HBox(20);
        header.getStyleClass().add("header-bar");
        header.setAlignment(Pos.CENTER_LEFT);
        header.setPadding(new Insets(15, 30, 15, 30));

        Label logoLabel = new Label("💡 D-MERS Innovation & Smart Features (Viva Presentation Guide)");
        logoLabel.getStyleClass().add("h2");

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        Button backBtn = new Button("← Back to Dashboard");
        backBtn.getStyleClass().addAll("button", "button-secondary");
        backBtn.setOnAction(e -> new LandingView(stage).show());

        header.getChildren().addAll(logoLabel, spacer, backBtn);
        root.setTop(header);

        VBox content = new VBox(25);
        content.setPadding(new Insets(30, 50, 40, 50));
        content.setMaxWidth(1100);

        Label mainTitle = new Label("Key Technical Innovations & Decision Support Engines");
        mainTitle.getStyleClass().add("h1");

        Label mainSub = new Label("Use this section during your academic project presentation to explain to faculty members what makes D-MERS an advanced decision-support platform rather than a simple CRUD application.");
        mainSub.getStyleClass().add("subtitle");
        mainSub.setWrapText(true);

        VBox featuresContainer = new VBox(20);

        // Feature 1
        featuresContainer.getChildren().add(createFeatureSection(
                "1. Smart Rescue Priority Engine (Java Priority Engine)",
                "• Automatically computes a decision-support Priority Score from 0 to 100 based on multi-factor weighted evaluation.\n" +
                "• Evaluates: Base Severity (up to 40 pts) + Affected People Scale (up to 20 pts) + Immediate Assistance Need (up to 15 pts) + Trauma Medical Needs (15 pts) + Hazard Risk (up to 10 pts) + Elapsed Waiting Time bonus.\n" +
                "• Categorizes requests into LOW, MEDIUM, HIGH, and CRITICAL classifications for emergency response teams.\n" +
                "• Implementation: com.disastermanagement.smart.PriorityEngine.java",
                "#2563EB"
        ));

        // Feature 2
        featuresContainer.getChildren().add(createFeatureSection(
                "2. Emergency Timeline Tracking System",
                "• Generates an immutable, chronological event history log for every single rescue request from submission to completion.\n" +
                "• Logs timestamps & operational events: Request Created → Priority Calculated → Team Assigned → Mission Accepted → Operation Started (with response notes) → Rescues Completed.\n" +
                "• Visible to Citizens, Rescue Teams, and Administrators to ensure complete operational accountability.\n" +
                "• Implementation: com.disastermanagement.model.EmergencyTimeline.java & EmergencyTimelineDAO.java",
                "#059669"
        ));

        // Feature 3
        featuresContainer.getChildren().add(createFeatureSection(
                "3. Smart Volunteer Matching Engine",
                "• Evaluates registered volunteers against open relief tasks using a 3-tier matching formula (0-100% Match Score).\n" +
                "• Matching Factors: Skill Compatibility (50%) + Availability Status (30%) + Location Proximity (20%).\n" +
                "• Ranks recommended volunteers automatically and suggests high-compatibility tasks on volunteer dashboards.\n" +
                "• Implementation: com.disastermanagement.smart.VolunteerMatchingService.java",
                "#EA580C"
        ));

        // Feature 4
        featuresContainer.getChildren().add(createFeatureSection(
                "4. Shelter Capacity Intelligence System",
                "• Provides color-coded real-time-style occupancy telemetry: Green (Plenty of Space, <70%), Yellow (Nearly Full, 70-90%), Red (Full, >90%).\n" +
                "• Automatically calculates Available Spaces = Maximum Capacity - Current Occupancy.\n" +
                "• Includes instant filter controls for Available Space, Food Supply, Clean Water, and Medical Facilities.\n" +
                "• Implementation: com.disastermanagement.model.Shelter.java & ShelterDAO.java",
                "#7C3AED"
        ));

        // Feature 5
        featuresContainer.getChildren().add(createFeatureSection(
                "5. Unified Disaster Monitoring & Spatial Severity Grid",
                "• Combines active disaster reports, shelter occupancy, and rescue operation SOS pins onto an interactive visual spatial grid.\n" +
                "• Color-coded incident markers allow commanders and teams to visualize disaster density and allocate resources efficiently.\n" +
                "• Features instant severity filtering and legend markers.\n" +
                "• Implementation: com.disastermanagement.view.DisasterMapView.java",
                "#DC2626"
        ));

        content.getChildren().addAll(mainTitle, mainSub, featuresContainer);

        ScrollPane scroll = new ScrollPane(content);
        scroll.setFitToWidth(true);
        scroll.setStyle("-fx-background: #F8FAFC; -fx-background-color: #F8FAFC;");
        root.setCenter(scroll);

        Scene scene = new Scene(root, 1180, 780);
        scene.getStylesheets().add(getClass().getResource("/css/styles.css").toExternalForm());
        stage.setTitle("D-MERS - Unique Project Features & Viva Guide");
        stage.setScene(scene);
        stage.show();
    }

    private VBox createFeatureSection(String title, String details, String colorHex) {
        VBox box = new VBox(10);
        box.getStyleClass().add("card");
        box.setStyle("-fx-border-color: " + colorHex + "; -fx-border-width: 0 0 0 5px;");

        Label tLabel = new Label(title);
        tLabel.setStyle("-fx-font-size: 18px; -fx-font-weight: 800; -fx-text-fill: #0F172A;");

        Label dLabel = new Label(details);
        dLabel.setStyle("-fx-font-size: 13.5px; -fx-text-fill: #334155; -fx-line-spacing: 4px;");
        dLabel.setWrapText(true);

        box.getChildren().addAll(tLabel, dLabel);
        return box;
    }
}
