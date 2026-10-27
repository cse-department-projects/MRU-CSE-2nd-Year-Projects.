package com.disastermanagement.view;

import com.disastermanagement.dao.*;
import com.disastermanagement.model.*;
import com.disastermanagement.util.UIUtils;
import com.disastermanagement.view.components.*;

import javafx.beans.property.SimpleStringProperty;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.stage.Modality;
import javafx.stage.Stage;

import java.util.List;

public class RescueTeamDashboard {
    private final Stage stage;
    private final User currentUser;

    private final RescueTeamDAO teamDAO = new RescueTeamDAO();
    private final RescueRequestDAO rescueDAO = new RescueRequestDAO();
    private final DisasterReportDAO disasterDAO = new DisasterReportDAO();
    private final EmergencyAlertDAO alertDAO = new EmergencyAlertDAO();
    private final EmergencyTimelineDAO timelineDAO = new EmergencyTimelineDAO();

    private BorderPane mainLayout;
    private VBox contentArea;
    private RescueTeam rescueTeam;

    public RescueTeamDashboard(Stage stage) {
        this.stage = stage;
        this.currentUser = com.disastermanagement.service.AuthService.getCurrentUser();
        this.rescueTeam = teamDAO.findByUserId(currentUser.getId());
    }

    public RescueTeamDashboard(Stage stage, User currentUser, Runnable ignored) {
        this.stage = stage;
        this.currentUser = currentUser != null ? currentUser : com.disastermanagement.service.AuthService.getCurrentUser();
        this.rescueTeam = teamDAO.findByUserId(this.currentUser.getId());
    }

    public void show() {
        mainLayout = new BorderPane();
        mainLayout.getStyleClass().add("root");

        HeaderBar header = new HeaderBar(currentUser, () -> {
            com.disastermanagement.service.AuthService.logout();
            new LandingView(stage).show();
        });
        mainLayout.setTop(header);

        Sidebar sidebar = new Sidebar("Rescue Team");
        sidebar.addNavItem("assigned", "🚨 Dispatch Queue & Missions", k -> showRescueRequestsView());
        sidebar.addNavItem("map", "🗺 Disaster Map & Severity Grid", k -> showMapView());
        sidebar.addNavItem("disasters", "📋 Disaster Incident Reports", k -> showDisastersView());
        sidebar.addNavItem("alerts", "📢 Active Emergency Alerts", k -> showAlertsView());
        sidebar.addNavItem("viva", "💡 Smart Features (Viva)", k -> new InnovationFeaturesView(stage).show());
        sidebar.addNavItem("profile", "🛡 Team Profile", k -> showTeamProfileView());

        mainLayout.setLeft(sidebar);

        contentArea = new VBox(20);
        contentArea.setPadding(new Insets(24));

        ScrollPane scrollPane = new ScrollPane(contentArea);
        scrollPane.setFitToWidth(true);
        scrollPane.setStyle("-fx-background-color: transparent; -fx-background: #F8FAFC;");
        mainLayout.setCenter(scrollPane);

        sidebar.setActive("assigned");
        showRescueRequestsView();

        Scene scene = new Scene(mainLayout, 1180, 780);
        scene.getStylesheets().add(getClass().getResource("/css/styles.css").toExternalForm());
        stage.setScene(scene);
        stage.setTitle("D-MERS - Rescue Team Dispatch Console");
        stage.show();
    }

    private void showRescueRequestsView() {
        contentArea.getChildren().clear();

        Label title = new Label("Rescue Team Operations & Dispatch Console");
        title.getStyleClass().add("h1");

        // Stat cards
        int teamId = rescueTeam != null ? rescueTeam.getTeamId() : 0;
        List<RescueRequest> list = rescueDAO.getRequestsByTeam(teamId);
        long pending = list.stream().filter(r -> r.getStatus() == RescueRequest.RequestStatus.PENDING).count();
        long active = list.stream().filter(r -> r.getStatus() == RescueRequest.RequestStatus.ASSIGNED || r.getStatus() == RescueRequest.RequestStatus.ACCEPTED || r.getStatus() == RescueRequest.RequestStatus.IN_PROGRESS).count();
        long completed = list.stream().filter(r -> r.getStatus() == RescueRequest.RequestStatus.COMPLETED).count();

        HBox statsBox = new HBox(15,
                new StatCard("Pending SOS Queue", String.valueOf(pending), "#EA580C"),
                new StatCard("Active Missions", String.valueOf(active), "#2563EB"),
                new StatCard("Completed Operations", String.valueOf(completed), "#059669")
        );

        TableView<RescueRequest> table = new TableView<>();
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);

        TableColumn<RescueRequest, String> idCol = new TableColumn<>("SOS ID");
        idCol.setCellValueFactory(c -> new SimpleStringProperty("#" + c.getValue().getRequestId()));

        TableColumn<RescueRequest, String> citizenCol = new TableColumn<>("Citizen");
        citizenCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getCitizenName() != null ? c.getValue().getCitizenName() : "Citizen #" + c.getValue().getCitizenId()));

        TableColumn<RescueRequest, String> contactCol = new TableColumn<>("Contact Phone");
        contactCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getContactNumber()));

        TableColumn<RescueRequest, String> locCol = new TableColumn<>("Location");
        locCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getLocation()));

        TableColumn<RescueRequest, String> peopleCol = new TableColumn<>("People");
        peopleCol.setCellValueFactory(c -> new SimpleStringProperty(String.valueOf(c.getValue().getNumPeople())));

        TableColumn<RescueRequest, String> scoreCol = new TableColumn<>("Priority Score");
        scoreCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getPriorityScore() + "/100 (" + c.getValue().getPriority().name() + ")"));

        TableColumn<RescueRequest, String> statusCol = new TableColumn<>("Status Workflow");
        statusCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getStatus().name()));
        statusCol.setCellFactory(col -> new TableCell<>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) setGraphic(null);
                else setGraphic(new StatusBadge(item, "status"));
            }
        });

        table.getColumns().addAll(idCol, citizenCol, contactCol, locCol, peopleCol, scoreCol, statusCol);
        table.getItems().addAll(list);

        // Action Toolbar
        HBox actions = new HBox(12);

        Button acceptBtn = new Button("1. Accept Mission");
        acceptBtn.getStyleClass().addAll("button", "button-warning");
        acceptBtn.setOnAction(e -> {
            RescueRequest sel = table.getSelectionModel().getSelectedItem();
            if (sel == null) {
                UIUtils.showWarning("No Selection", "Please select a rescue request to accept.");
                return;
            }
            if (rescueTeam == null) {
                UIUtils.showError("No Team Profile", "Rescue team profile missing.");
                return;
            }
            boolean ok = rescueDAO.updateStatusAndTeam(sel.getRequestId(), RescueRequest.RequestStatus.ACCEPTED, rescueTeam.getTeamId(), rescueTeam.getTeamName(), "Mission accepted by rescue unit.");
            if (ok) {
                UIUtils.showInformation("Mission Accepted", "Rescue Mission #" + sel.getRequestId() + " accepted by " + rescueTeam.getTeamName());
                showRescueRequestsView();
            }
        });

        Button progressBtn = new Button("2. Start Operation / In Progress");
        progressBtn.getStyleClass().addAll("button", "button-primary");
        progressBtn.setOnAction(e -> {
            RescueRequest sel = table.getSelectionModel().getSelectedItem();
            if (sel != null && rescueTeam != null) {
                TextInputDialog notesDialog = new TextInputDialog("Dispatched 2 boats & 4 personnel to location.");
                notesDialog.setTitle("Add Operation Response Note");
                notesDialog.setHeaderText("Enter field update note for Emergency Timeline:");
                notesDialog.showAndWait().ifPresent(note -> {
                    rescueDAO.updateStatusAndTeam(sel.getRequestId(), RescueRequest.RequestStatus.IN_PROGRESS, rescueTeam.getTeamId(), rescueTeam.getTeamName(), note);
                    showRescueRequestsView();
                });
            }
        });

        Button completeBtn = new Button("3. Mark Operation Completed ✔");
        completeBtn.getStyleClass().addAll("button", "button-success");
        completeBtn.setOnAction(e -> {
            RescueRequest sel = table.getSelectionModel().getSelectedItem();
            if (sel != null && rescueTeam != null) {
                rescueDAO.updateStatusAndTeam(sel.getRequestId(), RescueRequest.RequestStatus.COMPLETED, rescueTeam.getTeamId(), rescueTeam.getTeamName(), "Rescue operation completed successfully. All victims evacuated.");
                UIUtils.showInformation("Operation Completed", "Rescue operation #" + sel.getRequestId() + " marked COMPLETED.");
                showRescueRequestsView();
            }
        });

        Button timelineBtn = new Button("📜 View Request Timeline");
        timelineBtn.getStyleClass().addAll("button", "button-secondary");
        timelineBtn.setOnAction(e -> {
            RescueRequest sel = table.getSelectionModel().getSelectedItem();
            if (sel != null) {
                showTimelineModal(sel);
            } else {
                UIUtils.showWarning("No Selection", "Please select a request to view timeline.");
            }
        });

        actions.getChildren().addAll(acceptBtn, progressBtn, completeBtn, timelineBtn);

        contentArea.getChildren().addAll(title, statsBox, actions, table);
    }

    private void showMapView() {
        contentArea.getChildren().clear();
        Label title = new Label("Unified Disaster Monitoring & Severity Grid");
        title.getStyleClass().add("h1");

        DisasterMapView mapView = new DisasterMapView();
        VBox mapContainer = mapView.createMapViewNode();
        contentArea.getChildren().addAll(title, mapContainer);
    }

    private void showTimelineModal(RescueRequest req) {
        Stage tStage = new Stage();
        tStage.initModality(Modality.APPLICATION_MODAL);
        tStage.setTitle("Emergency Timeline - Request #" + req.getRequestId());

        VBox layout = new VBox(15);
        layout.setPadding(new Insets(20));
        layout.setStyle("-fx-background-color: #FFFFFF;");

        Label header = new Label("📜 Operation Timeline (Request #" + req.getRequestId() + ")");
        header.getStyleClass().add("h2");

        ListView<String> timelineList = new ListView<>();
        List<EmergencyTimeline> events = timelineDAO.getTimelineForRequest(req.getRequestId());
        if (events.isEmpty()) {
            timelineList.getItems().add("No timeline records logged yet.");
        } else {
            for (EmergencyTimeline et : events) {
                timelineList.getItems().add("⏱ " + et.getCreatedAt().toString().replace("T", " ") + " [" + et.getEventType() + "]\n" + et.getDescription() + " (By: " + et.getCreatedBy() + ")");
            }
        }

        Button closeBtn = new Button("Close");
        closeBtn.getStyleClass().addAll("button", "button-primary");
        closeBtn.setOnAction(e -> tStage.close());

        layout.getChildren().addAll(header, timelineList, closeBtn);
        tStage.setScene(new Scene(layout, 550, 450));
        tStage.show();
    }

    private void showDisastersView() {
        contentArea.getChildren().clear();

        Label title = new Label("Disaster Incident Reports");
        title.getStyleClass().add("h1");

        TableView<DisasterReport> table = new TableView<>();
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);

        TableColumn<DisasterReport, String> idCol = new TableColumn<>("ID");
        idCol.setCellValueFactory(c -> new SimpleStringProperty("#" + c.getValue().getReportId()));

        TableColumn<DisasterReport, String> typeCol = new TableColumn<>("Disaster Type");
        typeCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getDisasterType()));

        TableColumn<DisasterReport, String> locCol = new TableColumn<>("Location");
        locCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getLocation()));

        TableColumn<DisasterReport, String> sevCol = new TableColumn<>("Severity");
        sevCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getSeverity()));
        sevCol.setCellFactory(col -> new TableCell<>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) setGraphic(null);
                else setGraphic(new StatusBadge(item, "severity"));
            }
        });

        TableColumn<DisasterReport, String> affectedCol = new TableColumn<>("Affected / Help");
        affectedCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getAffectedPeople() + " / " + c.getValue().getPeopleNeedingHelp()));

        TableColumn<DisasterReport, String> descCol = new TableColumn<>("Description");
        descCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getDescription()));

        table.getColumns().addAll(idCol, typeCol, locCol, sevCol, affectedCol, descCol);
        table.getItems().addAll(disasterDAO.getAllReports());

        contentArea.getChildren().addAll(title, table);
    }

    private void showAlertsView() {
        contentArea.getChildren().clear();
        Label title = new Label("Active Emergency Broadcasts");
        title.getStyleClass().add("h1");

        VBox list = new VBox(12);
        for (EmergencyAlert alert : alertDAO.getActiveAlerts()) {
            VBox alertCard = new VBox(8);
            alertCard.getStyleClass().add("card");
            Label alertTitle = new Label("📢 " + alert.getTitle());
            alertTitle.getStyleClass().add("h2");
            Label msg = new Label(alert.getMessage());
            msg.setWrapText(true);
            alertCard.getChildren().addAll(alertTitle, msg);
            list.getChildren().add(alertCard);
        }
        contentArea.getChildren().addAll(title, list);
    }

    private void showTeamProfileView() {
        contentArea.getChildren().clear();
        Label title = new Label("Rescue Team Profile");
        title.getStyleClass().add("h1");

        VBox card = new VBox(12);
        card.getStyleClass().add("card");
        card.setMaxWidth(500);

        if (rescueTeam != null) {
            card.getChildren().addAll(
                    new Label("Team Name: " + rescueTeam.getTeamName()),
                    new Label("Leader Name: " + rescueTeam.getLeaderName()),
                    new Label("Contact Number: " + rescueTeam.getContactNumber()),
                    new Label("Specialization: " + rescueTeam.getSpecialization()),
                    new Label("Current Status: " + rescueTeam.getActiveStatus().name())
            );
        } else {
            card.getChildren().add(new Label("No team profile initialized for this account."));
        }

        contentArea.getChildren().addAll(title, card);
    }
}
