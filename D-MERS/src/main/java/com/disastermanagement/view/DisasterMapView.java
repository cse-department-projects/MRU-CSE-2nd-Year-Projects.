package com.disastermanagement.view;

import com.disastermanagement.dao.DisasterReportDAO;
import com.disastermanagement.dao.RescueRequestDAO;
import com.disastermanagement.dao.ShelterDAO;
import com.disastermanagement.model.DisasterReport;
import com.disastermanagement.model.RescueRequest;
import com.disastermanagement.model.Shelter;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;

import java.util.List;

/**
 * Visual Disaster Map & Severity Monitoring Grid (Unique Feature #5)
 * Renders spatial location nodes for active disasters, shelters, and rescue operations.
 */
public class DisasterMapView {

    private final DisasterReportDAO disasterDAO = new DisasterReportDAO();
    private final RescueRequestDAO rescueDAO = new RescueRequestDAO();
    private final ShelterDAO shelterDAO = new ShelterDAO();

    public VBox createMapViewNode() {
        VBox root = new VBox(15);
        root.getStyleClass().add("card");
        root.setPadding(new Insets(20));

        Label mapHeader = new Label("🗺 Interactive Disaster Severity & Spatial Incident Map");
        mapHeader.getStyleClass().add("h2");

        Label mapSub = new Label("Displays live incident pins color-coded by Smart Severity Level (Red: Critical, Orange: High, Yellow: Medium, Green: Shelter).");
        mapSub.getStyleClass().add("subtitle");

        // Filter Controls
        CheckBox showDisastersCb = new CheckBox("Active Disasters"); showDisastersCb.setSelected(true);
        CheckBox showRescuesCb = new CheckBox("Rescue Operations"); showRescuesCb.setSelected(true);
        CheckBox showSheltersCb = new CheckBox("Relief Shelters"); showSheltersCb.setSelected(true);

        ComboBox<String> severityFilter = new ComboBox<>();
        severityFilter.getItems().addAll("ALL SEVERITIES", "CRITICAL", "HIGH", "MEDIUM", "LOW");
        severityFilter.setValue("ALL SEVERITIES");

        HBox filterBox = new HBox(15, showDisastersCb, showRescuesCb, showSheltersCb, new Label("Filter Severity:"), severityFilter);
        filterBox.setAlignment(Pos.CENTER_LEFT);

        Canvas canvas = new Canvas(1000, 420);
        GraphicsContext gc = canvas.getGraphicsContext2D();

        Runnable renderMap = () -> {
            // Background Grid Map Representation
            gc.clearRect(0, 0, 1000, 420);

            // Draw Background terrain & grid
            gc.setFill(Color.web("#F1F5F9"));
            gc.fillRect(0, 0, 1000, 420);

            gc.setStroke(Color.web("#E2E8F0"));
            gc.setLineWidth(1.0);
            for (int x = 0; x < 1000; x += 50) {
                gc.strokeLine(x, 0, x, 420);
            }
            for (int y = 0; y < 420; y += 50) {
                gc.strokeLine(0, y, 1000, y);
            }

            // Draw Region Landmarks
            gc.setFill(Color.web("#94A3B8"));
            gc.setFont(javafx.scene.text.Font.font("Segoe UI", javafx.scene.text.FontWeight.BOLD, 12));
            gc.fillText("SECTOR 1 (NORTH HILLS)", 50, 40);
            gc.fillText("SECTOR 2 (RIVERBANK COLONY)", 350, 40);
            gc.fillText("SECTOR 3 (DOWNTOWN CENTER)", 700, 40);
            gc.fillText("SECTOR 4 (INDUSTRIAL ZONE)", 200, 380);
            gc.fillText("SECTOR 5 (COASTAL HIGHWAY)", 650, 380);

            String selectedSev = severityFilter.getValue();

            // 1. Draw Active Disasters
            if (showDisastersCb.isSelected()) {
                List<DisasterReport> reports = disasterDAO.getAllReports();
                int i = 0;
                for (DisasterReport dr : reports) {
                    if (!"ALL SEVERITIES".equals(selectedSev) && !dr.getSeverity().equalsIgnoreCase(selectedSev)) {
                        continue;
                    }
                    double x = 120 + (i * 180) % 800;
                    double y = 100 + ((i * 90) % 240);

                    Color pinColor = Color.web("#2563EB");
                    if ("CRITICAL".equalsIgnoreCase(dr.getSeverity())) pinColor = Color.web("#DC2626");
                    else if ("HIGH".equalsIgnoreCase(dr.getSeverity())) pinColor = Color.web("#EA580C");
                    else if ("MEDIUM".equalsIgnoreCase(dr.getSeverity())) pinColor = Color.web("#D97706");

                    gc.setFill(pinColor);
                    gc.fillOval(x - 14, y - 14, 28, 28);
                    gc.setStroke(Color.WHITE);
                    gc.setLineWidth(2);
                    gc.strokeOval(x - 14, y - 14, 28, 28);

                    gc.setFill(Color.web("#0F172A"));
                    gc.setFont(javafx.scene.text.Font.font("Segoe UI", javafx.scene.text.FontWeight.BOLD, 11));
                    gc.fillText("🚨 " + dr.getDisasterType() + " (#" + dr.getReportId() + ")", x + 18, y + 4);
                    gc.setFont(javafx.scene.text.Font.font("Segoe UI", 10));
                    gc.fillText(dr.getLocation() + " [" + dr.getSeverity() + "]", x + 18, y + 18);
                    i++;
                }
            }

            // 2. Draw Shelters
            if (showSheltersCb.isSelected()) {
                List<Shelter> shelters = shelterDAO.getAllShelters();
                int i = 0;
                for (Shelter s : shelters) {
                    double x = 200 + (i * 280) % 750;
                    double y = 80 + ((i * 120) % 280);

                    gc.setFill(Color.web(s.getStatusColorHex()));
                    gc.fillRect(x - 12, y - 12, 24, 24);
                    gc.setStroke(Color.WHITE);
                    gc.setLineWidth(2);
                    gc.strokeRect(x - 12, y - 12, 24, 24);

                    gc.setFill(Color.web("#0F172A"));
                    gc.setFont(javafx.scene.text.Font.font("Segoe UI", javafx.scene.text.FontWeight.BOLD, 11));
                    gc.fillText("🏠 " + s.getName(), x + 16, y + 2);
                    gc.setFont(javafx.scene.text.Font.font("Segoe UI", 10));
                    gc.fillText("Cap: " + s.getCurrentOccupancy() + "/" + s.getCapacity() + " (" + s.getOccupancyStatus() + ")", x + 16, y + 16);
                    i++;
                }
            }

            // 3. Draw Active Rescue Requests
            if (showRescuesCb.isSelected()) {
                List<RescueRequest> rescues = rescueDAO.getAllRequestsSortedByPriority();
                int i = 0;
                for (RescueRequest rr : rescues) {
                    if (!"ALL SEVERITIES".equals(selectedSev) && !rr.getPriority().name().equalsIgnoreCase(selectedSev)) {
                        continue;
                    }
                    double x = 160 + (i * 220) % 800;
                    double y = 140 + ((i * 80) % 220);

                    gc.setFill(Color.web("#7C3AED"));
                    double[] xPoints = {x, x - 12, x + 12};
                    double[] yPoints = {y - 12, y + 12, y + 12};
                    gc.fillPolygon(xPoints, yPoints, 3);

                    gc.setFill(Color.web("#0F172A"));
                    gc.setFont(javafx.scene.text.Font.font("Segoe UI", javafx.scene.text.FontWeight.BOLD, 11));
                    gc.fillText("🆘 SOS #" + rr.getRequestId() + " (" + rr.getPriorityScore() + " pts)", x + 16, y + 2);
                    i++;
                }
            }
        };

        showDisastersCb.setOnAction(e -> renderMap.run());
        showRescuesCb.setOnAction(e -> renderMap.run());
        showSheltersCb.setOnAction(e -> renderMap.run());
        severityFilter.setOnAction(e -> renderMap.run());

        renderMap.run();

        // Legend Bar
        HBox legendBar = new HBox(20);
        legendBar.setAlignment(Pos.CENTER);
        legendBar.setPadding(new Insets(10));
        legendBar.setStyle("-fx-background-color: #F1F5F9; -fx-background-radius: 8px;");

        legendBar.getChildren().addAll(
                createLegendItem("🔴 Critical Severity", "#DC2626"),
                createLegendItem("🟠 High Severity", "#EA580C"),
                createLegendItem("🟡 Medium Severity", "#D97706"),
                createLegendItem("🟢 Available Shelter", "#059669"),
                createLegendItem("🟣 Rescue Operation SOS", "#7C3AED")
        );

        root.getChildren().addAll(mapHeader, mapSub, filterBox, canvas, legendBar);
        return root;
    }

    private HBox createLegendItem(String label, String hexColor) {
        HBox box = new HBox(6);
        box.setAlignment(Pos.CENTER);
        Label colorDot = new Label("  ");
        colorDot.setStyle("-fx-background-color: " + hexColor + "; -fx-padding: 4px 8px; -fx-background-radius: 4px;");
        Label text = new Label(label);
        text.setStyle("-fx-font-size: 12px; -fx-font-weight: bold; -fx-text-fill: #334155;");
        box.getChildren().addAll(colorDot, text);
        return box;
    }
}
