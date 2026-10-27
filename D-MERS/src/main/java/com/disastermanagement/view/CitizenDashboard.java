package com.disastermanagement.view;

import com.disastermanagement.dao.*;
import com.disastermanagement.model.*;
import com.disastermanagement.smart.PriorityEngine;
import com.disastermanagement.util.UIUtils;
import com.disastermanagement.view.components.*;

import javafx.beans.property.SimpleStringProperty;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.stage.FileChooser;
import javafx.stage.Modality;
import javafx.stage.Stage;

import java.io.File;
import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

public class CitizenDashboard {
    private final Stage stage;
    private final User currentUser;

    private final DisasterReportDAO disasterDAO = new DisasterReportDAO();
    private final RescueRequestDAO rescueDAO = new RescueRequestDAO();
    private final ShelterDAO shelterDAO = new ShelterDAO();
    private final MissingPersonDAO missingDAO = new MissingPersonDAO();
    private final EmergencyAlertDAO alertDAO = new EmergencyAlertDAO();
    private final EmergencyTimelineDAO timelineDAO = new EmergencyTimelineDAO();
    private final EmergencyContactDAO contactDAO = new EmergencyContactDAO();

    private BorderPane mainLayout;
    private VBox contentArea;

    public CitizenDashboard(Stage stage) {
        this.stage = stage;
        this.currentUser = com.disastermanagement.service.AuthService.getCurrentUser();
    }

    public CitizenDashboard(Stage stage, User currentUser, Runnable ignored) {
        this.stage = stage;
        this.currentUser = currentUser != null ? currentUser : com.disastermanagement.service.AuthService.getCurrentUser();
    }

    public void show() {
        mainLayout = new BorderPane();
        mainLayout.getStyleClass().add("root");

        // Header
        HeaderBar header = new HeaderBar(currentUser, () -> {
            com.disastermanagement.service.AuthService.logout();
            new LandingView(stage).show();
        });
        mainLayout.setTop(header);

        // Sidebar Navigation
        Sidebar sidebar = new Sidebar("Citizen");
        sidebar.addNavItem("home", "📊 Dashboard Overview", k -> showHomeView());
        sidebar.addNavItem("report_disaster", "🚨 Report Disaster", k -> showReportDisasterView());
        sidebar.addNavItem("request_rescue", "🆘 Request Rescue (SOS)", k -> showRequestRescueView());
        sidebar.addNavItem("my_requests", "📋 My Rescue Requests & Timeline", k -> showMyRequestsView());
        sidebar.addNavItem("shelters", "🏠 Shelter Intelligence", k -> showSheltersView());
        sidebar.addNavItem("alerts", "📢 Emergency Alerts", k -> showAlertsView());
        sidebar.addNavItem("missing", "🔍 Missing Persons", k -> showMissingPersonsView());
        sidebar.addNavItem("contacts", "📞 Emergency Contacts", k -> showEmergencyContactsView());
        sidebar.addNavItem("viva", "💡 Smart Features (Viva)", k -> new InnovationFeaturesView(stage).show());
        sidebar.addNavItem("profile", "👤 My Profile", k -> showProfileView());

        mainLayout.setLeft(sidebar);

        // Content Area
        contentArea = new VBox(20);
        contentArea.setPadding(new Insets(24));

        ScrollPane scrollPane = new ScrollPane(contentArea);
        scrollPane.setFitToWidth(true);
        scrollPane.setStyle("-fx-background-color: transparent; -fx-background: #F8FAFC;");
        mainLayout.setCenter(scrollPane);

        sidebar.setActive("home");
        showHomeView();

        Scene scene = new Scene(mainLayout, 1180, 780);
        scene.getStylesheets().add(getClass().getResource("/css/styles.css").toExternalForm());
        stage.setScene(scene);
        stage.setTitle("D-MERS - Citizen Emergency Portal");
        stage.show();
    }

    private void showHomeView() {
        contentArea.getChildren().clear();

        Label title = new Label("Citizen Emergency & Rescue Portal");
        title.getStyleClass().add("h1");

        Label sub = new Label("Report incidents, calculate Smart Rescue Priority scores, track timeline progress, and locate available shelters.");
        sub.getStyleClass().add("subtitle");

        List<RescueRequest> myRequests = rescueDAO.getRequestsByCitizen(currentUser.getId());
        long pendingRescues = myRequests.stream().filter(r -> r.getStatus() == RescueRequest.RequestStatus.PENDING || r.getStatus() == RescueRequest.RequestStatus.ASSIGNED).count();

        HBox statsBox = new HBox(15,
                new StatCard("My Total Requests", String.valueOf(myRequests.size()), "#2563EB"),
                new StatCard("Active Rescues", String.valueOf(pendingRescues), "#EA580C"),
                new StatCard("Available Shelters", String.valueOf(shelterDAO.getAvailableSheltersCount()), "#059669"),
                new StatCard("Broadcast Alerts", String.valueOf(alertDAO.getActiveAlerts().size()), "#DC2626")
        );

        // Active Emergency Alerts Banner Container
        VBox alertsContainer = new VBox(10);
        Label alertHeader = new Label("EMERGENCY BROADCAST ALERTS");
        alertHeader.getStyleClass().add("h2");
        alertsContainer.getChildren().add(alertHeader);

        List<EmergencyAlert> activeAlerts = alertDAO.getActiveAlerts();
        if (activeAlerts.isEmpty()) {
            Label noAlert = new Label("No active emergency alerts broadcasted at this time.");
            noAlert.setStyle("-fx-text-fill: #059669; -fx-font-style: italic; -fx-font-weight: bold;");
            alertsContainer.getChildren().add(noAlert);
        } else {
            for (EmergencyAlert alert : activeAlerts) {
                VBox alertCard = new VBox(6);
                alertCard.getStyleClass().add("CRITICAL".equalsIgnoreCase(alert.getSeverity().getLabel()) ? "alert-card-critical" : "alert-card-warning");

                Label alertTitle = new Label("📢 " + alert.getTitle() + " [" + alert.getSeverity().getLabel() + "]");
                alertTitle.setStyle("-fx-font-weight: bold; -fx-font-size: 15px; -fx-text-fill: #991B1B;");

                Label alertMsg = new Label(alert.getMessage());
                alertMsg.setWrapText(true);
                alertMsg.setStyle("-fx-text-fill: #7F1D1D; -fx-font-size: 13px;");

                alertCard.getChildren().addAll(alertTitle, alertMsg);
                alertsContainer.getChildren().add(alertCard);
            }
        }

        // Quick Action Buttons
        HBox actionBox = new HBox(15);
        Button btnReport = new Button("🚨 Report New Disaster");
        btnReport.getStyleClass().addAll("button", "button-danger");
        btnReport.setOnAction(e -> showReportDisasterView());

        Button btnRescue = new Button("🆘 Request SOS Rescue");
        btnRescue.getStyleClass().addAll("button", "button-warning");
        btnRescue.setOnAction(e -> showRequestRescueView());

        Button btnShelters = new Button("🏠 Shelter Capacity Intelligence");
        btnShelters.getStyleClass().addAll("button", "button-success");
        btnShelters.setOnAction(e -> showSheltersView());

        actionBox.getChildren().addAll(btnReport, btnRescue, btnShelters);

        contentArea.getChildren().addAll(title, sub, statsBox, alertsContainer, actionBox);
    }

    private void showReportDisasterView() {
        contentArea.getChildren().clear();

        Label title = new Label("Report a Disaster Incident");
        title.getStyleClass().add("h1");

        VBox formCard = new VBox(15);
        formCard.getStyleClass().add("card");
        formCard.setMaxWidth(650);

        ComboBox<DisasterReport.DisasterType> typeCombo = new ComboBox<>();
        typeCombo.getItems().addAll(DisasterReport.DisasterType.values());
        typeCombo.setValue(DisasterReport.DisasterType.FLOOD);
        typeCombo.setMaxWidth(Double.MAX_VALUE);

        TextField locField = new TextField();
        locField.setPromptText("Incident Location (e.g. Riverbank Sector 5)");

        ComboBox<DisasterReport.Severity> severityCombo = new ComboBox<>();
        severityCombo.getItems().addAll(DisasterReport.Severity.values());
        severityCombo.setValue(DisasterReport.Severity.HIGH);
        severityCombo.setMaxWidth(Double.MAX_VALUE);

        Spinner<Integer> affectedSpinner = new Spinner<>(1, 500, 10);
        affectedSpinner.setEditable(true);

        Spinner<Integer> helpSpinner = new Spinner<>(1, 500, 5);
        helpSpinner.setEditable(true);

        TextField contactField = new TextField(currentUser.getPhone());
        contactField.setPromptText("Contact Number");

        TextArea descArea = new TextArea();
        descArea.setPromptText("Detailed description of the disaster incident...");
        descArea.setPrefRowCount(4);

        Label imgPathLabel = new Label("No photo attached");
        imgPathLabel.getStyleClass().add("subtitle");

        Button chooseImgBtn = new Button("Attach Image/Photo");
        chooseImgBtn.getStyleClass().add("button-secondary");
        final String[] imagePath = {null};
        chooseImgBtn.setOnAction(e -> {
            FileChooser fileChooser = new FileChooser();
            fileChooser.setTitle("Select Disaster Photo");
            fileChooser.getExtensionFilters().add(new FileChooser.ExtensionFilter("Image Files", "*.png", "*.jpg", "*.jpeg"));
            File file = fileChooser.showOpenDialog(stage);
            if (file != null) {
                imagePath[0] = file.getAbsolutePath();
                imgPathLabel.setText("Attached: " + file.getName());
            }
        });

        Button submitBtn = new Button("Submit Disaster Report");
        submitBtn.setMaxWidth(Double.MAX_VALUE);
        submitBtn.getStyleClass().addAll("button", "button-danger");
        submitBtn.setOnAction(e -> {
            if (locField.getText().trim().isEmpty() || descArea.getText().trim().isEmpty()) {
                UIUtils.showError("Validation Error", "Please specify location and detailed description.");
                return;
            }
            try {
                DisasterReport report = new DisasterReport();
                report.setCitizenId(currentUser.getId());
                report.setDisasterType(typeCombo.getValue());
                report.setLocation(locField.getText().trim());
                report.setSeverity(severityCombo.getValue());
                report.setDescription(descArea.getText().trim());
                report.setAffectedPeople(affectedSpinner.getValue());
                report.setPeopleNeedingHelp(helpSpinner.getValue());
                report.setContactNumber(contactField.getText().trim());
                report.setImagePath(imagePath[0]);
                report.setStatus(DisasterReport.ReportStatus.REPORTED);

                // Compute Smart Priority Score
                PriorityEngine.PriorityResult priorityRes = PriorityEngine.calculateReportPriority(report);
                report.setPriorityScore(priorityRes.getScore());

                boolean ok = disasterDAO.createReport(report);
                if (ok) {
                    UIUtils.showInformation("Disaster Report Filed",
                            "Disaster Report #" + report.getReportId() + " successfully logged!\n\n" +
                            "Computed Priority Score: " + priorityRes.getScore() + "/100 (" + priorityRes.getLevel() + ")\n\n" +
                            priorityRes.getBreakdown());
                    showHomeView();
                } else {
                    UIUtils.showError("Submission Error", "Failed to save disaster report. Please check input values.");
                }
            } catch (Exception ex) {
                UIUtils.showError("Error", "Error submitting report: " + ex.getMessage());
            }
        });

        formCard.getChildren().addAll(
                new Label("Disaster Type"), typeCombo,
                new Label("Location"), locField,
                new Label("Severity Level"), severityCombo,
                new Label("Total People Affected in Area"), affectedSpinner,
                new Label("People Requiring Immediate Assistance"), helpSpinner,
                new Label("Contact Number"), contactField,
                new Label("Incident Description"), descArea,
                new Label("Photo Evidence (Optional)"), chooseImgBtn, imgPathLabel,
                submitBtn
        );

        contentArea.getChildren().addAll(title, formCard);
    }

    private void showRequestRescueView() {
        contentArea.getChildren().clear();

        Label title = new Label("Request Emergency SOS Rescue");
        title.getStyleClass().add("h1");

        Label sub = new Label("The Smart Rescue Priority Engine will calculate your priority score in real-time to guide rescue teams.");
        sub.getStyleClass().add("subtitle");

        VBox formCard = new VBox(14);
        formCard.getStyleClass().add("card");
        formCard.setMaxWidth(650);

        TextField contactField = new TextField(currentUser.getPhone());
        contactField.setPromptText("Contact Phone Number");

        TextField locField = new TextField();
        locField.setPromptText("Exact Location / Landmark");

        TextField emergencyTypeField = new TextField("Flood Water Trapped");
        emergencyTypeField.setPromptText("Emergency Type (e.g. Trapped in Flood, Building Collapse)");

        Spinner<Integer> peopleSpinner = new Spinner<>(1, 100, 4);
        peopleSpinner.setEditable(true);

        ComboBox<RescueRequest.RequestPriority> priorityCombo = new ComboBox<>();
        priorityCombo.getItems().addAll(RescueRequest.RequestPriority.values());
        priorityCombo.setValue(RescueRequest.RequestPriority.CRITICAL);
        priorityCombo.setMaxWidth(Double.MAX_VALUE);

        CheckBox medicalBox = new CheckBox("Immediate Medical / Trauma Assistance Required");
        medicalBox.setStyle("-fx-font-weight: bold; -fx-text-fill: #DC2626;");
        medicalBox.setSelected(true);

        TextArea descArea = new TextArea();
        descArea.setPromptText("Describe trapped persons, injuries, water level, structural risks...");
        descArea.setPrefRowCount(3);

        Label scorePreview = new Label("Smart Rescue Priority Preview: 85/100 (CRITICAL)");
        scorePreview.setStyle("-fx-font-weight: 800; -fx-text-fill: #1E3A8A; -fx-background-color: #EFF6FF; -fx-padding: 10px; -fx-background-radius: 8px;");

        Runnable updateScorePreview = () -> {
            PriorityEngine.PriorityResult pRes = PriorityEngine.calculatePriority(
                    priorityCombo.getValue() != null ? priorityCombo.getValue().name() : "HIGH",
                    peopleSpinner.getValue(),
                    peopleSpinner.getValue(),
                    emergencyTypeField.getText(),
                    medicalBox.isSelected(),
                    java.time.LocalDateTime.now()
            );
            scorePreview.setText("Smart Rescue Priority Preview: " + pRes.getScore() + "/100 (" + pRes.getLevel() + ")");
        };

        priorityCombo.setOnAction(e -> updateScorePreview.run());
        medicalBox.setOnAction(e -> updateScorePreview.run());

        Button submitBtn = new Button("🆘 Submit Rescue SOS Request");
        submitBtn.getStyleClass().addAll("button", "button-danger");
        submitBtn.setMaxWidth(Double.MAX_VALUE);
        submitBtn.setStyle("-fx-font-size: 15px; -fx-padding: 12px;");

        submitBtn.setOnAction(e -> {
            if (contactField.getText().trim().isEmpty() || locField.getText().trim().isEmpty()) {
                UIUtils.showError("Validation Error", "Contact number and location are required.");
                return;
            }
            try {
                RescueRequest req = new RescueRequest();
                req.setCitizenId(currentUser.getId());
                req.setContactNumber(contactField.getText().trim());
                req.setLocation(locField.getText().trim());
                req.setEmergencyType(emergencyTypeField.getText().trim());
                req.setNumPeople(peopleSpinner.getValue());
                req.setPriority(priorityCombo.getValue());
                req.setMedicalAssistanceRequired(medicalBox.isSelected());
                req.setDescription(descArea.getText().trim());
                req.setStatus(RescueRequest.RequestStatus.PENDING);

                PriorityEngine.PriorityResult pRes = PriorityEngine.calculatePriority(
                        req.getPriority().name(),
                        req.getNumPeople(),
                        req.getNumPeople(),
                        req.getEmergencyType(),
                        req.isMedicalAssistanceRequired(),
                        req.getCreatedAtLocalDateTime()
                );
                req.setPriorityScore(pRes.getScore());

                boolean ok = rescueDAO.createRequest(req);
                if (ok) {
                    UIUtils.showInformation("SOS Rescue Broadcasted",
                            "Rescue Request #" + req.getRequestId() + " submitted to Rescue Dispatch!\n\n" +
                            "Smart Rescue Priority Score: " + pRes.getScore() + "/100 (" + pRes.getLevel() + ")\n\n" +
                            pRes.getBreakdown());
                    showMyRequestsView();
                } else {
                    UIUtils.showError("Submission Error", "Failed to broadcast rescue request.");
                }
            } catch (Exception ex) {
                UIUtils.showError("Error", "Error submitting rescue request: " + ex.getMessage());
            }
        });

        formCard.getChildren().addAll(
                new Label("Contact Phone Number"), contactField,
                new Label("Current Location / Address"), locField,
                new Label("Emergency Type"), emergencyTypeField,
                new Label("Number of People Requiring Rescue"), peopleSpinner,
                new Label("Declared Severity"), priorityCombo,
                medicalBox,
                new Label("Situation Summary"), descArea,
                scorePreview, submitBtn
        );

        contentArea.getChildren().addAll(title, sub, formCard);
    }

    private void showMyRequestsView() {
        contentArea.getChildren().clear();

        Label title = new Label("My Rescue Requests & Emergency Timeline");
        title.getStyleClass().add("h1");

        TableView<RescueRequest> table = new TableView<>();
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);

        TableColumn<RescueRequest, String> idCol = new TableColumn<>("Request ID");
        idCol.setCellValueFactory(c -> new SimpleStringProperty("#" + c.getValue().getRequestId()));

        TableColumn<RescueRequest, String> typeCol = new TableColumn<>("Emergency Type");
        typeCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getEmergencyType()));

        TableColumn<RescueRequest, String> locCol = new TableColumn<>("Location");
        locCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getLocation()));

        TableColumn<RescueRequest, String> scoreCol = new TableColumn<>("Smart Priority Score");
        scoreCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getPriorityScore() + "/100 (" + c.getValue().getPriority().name() + ")"));

        TableColumn<RescueRequest, String> statusCol = new TableColumn<>("Status");
        statusCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getStatus().name()));
        statusCol.setCellFactory(col -> new TableCell<>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) setGraphic(null);
                else setGraphic(new StatusBadge(item, "status"));
            }
        });

        TableColumn<RescueRequest, String> teamCol = new TableColumn<>("Assigned Team");
        teamCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getAssignedTeamName() != null ? c.getValue().getAssignedTeamName() : "Awaiting Assignment"));

        TableColumn<RescueRequest, Void> actionCol = new TableColumn<>("Emergency Timeline");
        actionCol.setCellFactory(col -> new TableCell<>() {
            private final Button timelineBtn = new Button("📜 View Timeline");
            {
                timelineBtn.getStyleClass().addAll("button", "button-secondary");
                timelineBtn.setOnAction(e -> {
                    RescueRequest req = getTableView().getItems().get(getIndex());
                    showTimelineModal(req);
                });
            }
            @Override
            protected void updateItem(Void item, boolean empty) {
                super.updateItem(item, empty);
                if (empty) setGraphic(null);
                else setGraphic(timelineBtn);
            }
        });

        table.getColumns().addAll(idCol, typeCol, locCol, scoreCol, statusCol, teamCol, actionCol);
        table.getItems().addAll(rescueDAO.getRequestsByCitizen(currentUser.getId()));

        contentArea.getChildren().addAll(title, table);
    }

    private void showTimelineModal(RescueRequest req) {
        Stage tStage = new Stage();
        tStage.initModality(Modality.APPLICATION_MODAL);
        tStage.setTitle("Emergency Timeline - Request #" + req.getRequestId());

        VBox layout = new VBox(15);
        layout.setPadding(new Insets(20));
        layout.setStyle("-fx-background-color: #FFFFFF;");

        Label header = new Label("📜 Emergency Operation Timeline (Request #" + req.getRequestId() + ")");
        header.getStyleClass().add("h2");

        Label detail = new Label("Location: " + req.getLocation() + " | Type: " + req.getEmergencyType() + " | Priority Score: " + req.getPriorityScore() + "/100");
        detail.getStyleClass().add("subtitle");

        ListView<String> timelineList = new ListView<>();
        List<EmergencyTimeline> events = timelineDAO.getTimelineForRequest(req.getRequestId());
        if (events.isEmpty()) {
            timelineList.getItems().add("No timeline records logged yet.");
        } else {
            for (EmergencyTimeline et : events) {
                timelineList.getItems().add("⏱ " + et.getCreatedAt().toString().replace("T", " ") + " [" + et.getEventType() + "]\n" + et.getDescription() + " (Logged by: " + et.getCreatedBy() + ")");
            }
        }

        Button closeBtn = new Button("Close");
        closeBtn.getStyleClass().addAll("button", "button-primary");
        closeBtn.setOnAction(e -> tStage.close());

        layout.getChildren().addAll(header, detail, timelineList, closeBtn);
        tStage.setScene(new Scene(layout, 550, 450));
        tStage.show();
    }

    private void showSheltersView() {
        contentArea.getChildren().clear();

        Label title = new Label("Shelter Capacity Intelligence");
        title.getStyleClass().add("h1");

        Label sub = new Label("Visual green, yellow, and red capacity indicators for emergency relief shelters.");
        sub.getStyleClass().add("subtitle");

        TextField searchField = new TextField();
        searchField.setPromptText("Search shelter by location or name...");

        CheckBox foodFilter = new CheckBox("Food Available");
        CheckBox waterFilter = new CheckBox("Water Available");
        CheckBox medicalFilter = new CheckBox("Medical Facility");
        CheckBox openOnlyFilter = new CheckBox("Only Available Space");

        HBox filterBox = new HBox(15, searchField, foodFilter, waterFilter, medicalFilter, openOnlyFilter);
        filterBox.setAlignment(Pos.CENTER_LEFT);

        TableView<Shelter> table = new TableView<>();
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);

        TableColumn<Shelter, String> nameCol = new TableColumn<>("Shelter Name");
        nameCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getName()));

        TableColumn<Shelter, String> locCol = new TableColumn<>("Location");
        locCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getLocation()));

        TableColumn<Shelter, String> capCol = new TableColumn<>("Capacity");
        capCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getCurrentOccupancy() + " / " + c.getValue().getCapacity()));

        TableColumn<Shelter, String> availCol = new TableColumn<>("Available Spaces");
        availCol.setCellValueFactory(c -> new SimpleStringProperty(String.valueOf(c.getValue().getAvailableSpaces())));

        TableColumn<Shelter, String> statusCol = new TableColumn<>("Capacity Status");
        statusCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getOccupancyStatus()));
        statusCol.setCellFactory(col -> new TableCell<>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) setGraphic(null);
                else {
                    Shelter s = getTableView().getItems().get(getIndex());
                    Label badge = new Label(item + " (" + (int)(s.getOccupancyPercentage()*100) + "%)");
                    badge.setStyle("-fx-background-color: " + s.getStatusColorHex() + "; -fx-text-fill: white; -fx-padding: 5px 12px; -fx-background-radius: 12px; -fx-font-weight: bold;");
                    setGraphic(badge);
                }
            }
        });

        TableColumn<Shelter, String> facCol = new TableColumn<>("Facilities");
        facCol.setCellValueFactory(c -> new SimpleStringProperty(
                (c.getValue().isFoodAvailable() ? "Food ✔ " : "") +
                (c.getValue().isWaterAvailable() ? "Water ✔ " : "") +
                (c.getValue().isMedicalFacility() ? "Medical ✔" : "")
        ));

        TableColumn<Shelter, String> phoneCol = new TableColumn<>("Contact Phone");
        phoneCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getContactNumber()));

        table.getColumns().addAll(nameCol, locCol, capCol, availCol, statusCol, facCol, phoneCol);

        Runnable refreshTable = () -> {
            table.getItems().clear();
            List<Shelter> list = shelterDAO.filterShelters(
                    searchField.getText(),
                    foodFilter.isSelected(),
                    waterFilter.isSelected(),
                    medicalFilter.isSelected(),
                    openOnlyFilter.isSelected()
            );
            table.getItems().addAll(list);
        };

        searchField.textProperty().addListener((o, old, n) -> refreshTable.run());
        foodFilter.setOnAction(e -> refreshTable.run());
        waterFilter.setOnAction(e -> refreshTable.run());
        medicalFilter.setOnAction(e -> refreshTable.run());
        openOnlyFilter.setOnAction(e -> refreshTable.run());

        refreshTable.run();

        contentArea.getChildren().addAll(title, sub, filterBox, table);
    }

    private void showAlertsView() {
        contentArea.getChildren().clear();

        Label title = new Label("Disaster & Emergency Alerts");
        title.getStyleClass().add("h1");

        VBox list = new VBox(12);
        List<EmergencyAlert> alerts = alertDAO.getAllAlerts();
        for (EmergencyAlert alert : alerts) {
            VBox alertCard = new VBox(8);
            alertCard.getStyleClass().add("card");

            HBox header = new HBox(10);
            Label alertTitle = new Label(alert.getTitle());
            alertTitle.getStyleClass().add("h2");

            StatusBadge sevBadge = new StatusBadge(alert.getSeverity().getLabel(), "severity");
            header.getChildren().addAll(alertTitle, sevBadge);

            Label typeLabel = new Label("Category: " + alert.getDisasterType().getLabel() + " | Published: " + alert.getCreatedAt());
            typeLabel.getStyleClass().add("subtitle");

            Label msg = new Label(alert.getMessage());
            msg.setWrapText(true);

            alertCard.getChildren().addAll(header, typeLabel, msg);
            list.getChildren().add(alertCard);
        }

        contentArea.getChildren().addAll(title, list);
    }

    private void showMissingPersonsView() {
        contentArea.getChildren().clear();

        Label title = new Label("Report / Search Missing Persons");
        title.getStyleClass().add("h1");

        Button reportMissingBtn = new Button("+ Report Missing Person");
        reportMissingBtn.getStyleClass().addAll("button", "button-warning");
        reportMissingBtn.setOnAction(e -> showReportMissingDialog());

        TableView<MissingPerson> table = new TableView<>();
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);

        TableColumn<MissingPerson, String> nameCol = new TableColumn<>("Name");
        nameCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getName()));

        TableColumn<MissingPerson, String> ageCol = new TableColumn<>("Age / Gender");
        ageCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getAge() + " / " + c.getValue().getGender().name()));

        TableColumn<MissingPerson, String> locCol = new TableColumn<>("Last Seen Location");
        locCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getLastSeenLocation()));

        TableColumn<MissingPerson, String> dateCol = new TableColumn<>("Date Last Seen");
        dateCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getDateLastSeen() != null ? c.getValue().getDateLastSeen().toString() : "N/A"));

        TableColumn<MissingPerson, String> descCol = new TableColumn<>("Description");
        descCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getDescription()));

        TableColumn<MissingPerson, String> contactCol = new TableColumn<>("Contact");
        contactCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getContactInfo()));

        TableColumn<MissingPerson, String> statusCol = new TableColumn<>("Status");
        statusCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getStatus().name()));
        statusCol.setCellFactory(col -> new TableCell<>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) setGraphic(null);
                else setGraphic(new StatusBadge(item, "status"));
            }
        });

        table.getColumns().addAll(nameCol, ageCol, locCol, dateCol, descCol, contactCol, statusCol);
        table.getItems().addAll(missingDAO.getAllReports());

        contentArea.getChildren().addAll(title, reportMissingBtn, table);
    }

    private void showReportMissingDialog() {
        Dialog<Boolean> dialog = new Dialog<>();
        dialog.setTitle("Report Missing Person");
        dialog.setHeaderText("Enter missing person details");

        VBox box = new VBox(10);
        box.setPadding(new Insets(15));

        TextField nameField = new TextField();
        nameField.setPromptText("Full Name");

        TextField ageField = new TextField();
        ageField.setPromptText("Age");

        ComboBox<MissingPerson.Gender> genderCombo = new ComboBox<>();
        genderCombo.getItems().addAll(MissingPerson.Gender.values());
        genderCombo.setValue(MissingPerson.Gender.MALE);

        TextField locField = new TextField();
        locField.setPromptText("Last Seen Location");

        DatePicker datePicker = new DatePicker(LocalDate.now());

        TextArea descArea = new TextArea();
        descArea.setPromptText("Physical description, clothing, distinguishing features...");

        TextField contactField = new TextField(currentUser.getPhone());
        contactField.setPromptText("Contact Info");

        box.getChildren().addAll(
                new Label("Name"), nameField,
                new Label("Age"), ageField,
                new Label("Gender"), genderCombo,
                new Label("Last Seen Location"), locField,
                new Label("Date Last Seen"), datePicker,
                new Label("Description"), descArea,
                new Label("Contact Number"), contactField
        );

        dialog.getDialogPane().setContent(box);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        dialog.setResultConverter(btn -> {
            if (btn == ButtonType.OK) {
                try {
                    MissingPerson mp = new MissingPerson();
                    mp.setReporterId(currentUser.getId());
                    mp.setName(nameField.getText().trim());
                    mp.setAge(Integer.parseInt(ageField.getText().trim()));
                    mp.setGender(genderCombo.getValue());
                    mp.setLastSeenLocation(locField.getText().trim());
                    mp.setDateLastSeen(Date.valueOf(datePicker.getValue()));
                    mp.setDescription(descArea.getText().trim());
                    mp.setContactInfo(contactField.getText().trim());
                    mp.setStatus(MissingPerson.PersonStatus.MISSING);
                    return missingDAO.createReport(mp);
                } catch (Exception ex) {
                    UIUtils.showError("Validation Error", "Invalid inputs: " + ex.getMessage());
                    return false;
                }
            }
            return false;
        });

        dialog.showAndWait().ifPresent(success -> {
            if (success) {
                UIUtils.showInformation("Report Filed", "Missing person report filed successfully.");
                showMissingPersonsView();
            }
        });
    }

    private void showEmergencyContactsView() {
        contentArea.getChildren().clear();

        Label title = new Label("Official Emergency Contacts & Helplines");
        title.getStyleClass().add("h1");

        TableView<EmergencyContact> table = new TableView<>();
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);

        TableColumn<EmergencyContact, String> catCol = new TableColumn<>("Category");
        catCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getCategory()));

        TableColumn<EmergencyContact, String> titleCol = new TableColumn<>("Helpline Service");
        titleCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getTitle()));

        TableColumn<EmergencyContact, String> phoneCol = new TableColumn<>("Phone Number");
        phoneCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getPhoneNumber()));
        phoneCol.setStyle("-fx-font-weight: bold; -fx-text-fill: #DC2626;");

        TableColumn<EmergencyContact, String> locCol = new TableColumn<>("Jurisdiction / Area");
        locCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getLocation()));

        TableColumn<EmergencyContact, String> notesCol = new TableColumn<>("Notes / Description");
        notesCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getNotes()));

        table.getColumns().addAll(catCol, titleCol, phoneCol, locCol, notesCol);
        table.getItems().addAll(contactDAO.getAllContacts());

        contentArea.getChildren().addAll(title, table);
    }

    private void showProfileView() {
        contentArea.getChildren().clear();

        Label title = new Label("My Profile");
        title.getStyleClass().add("h1");

        VBox card = new VBox(12);
        card.getStyleClass().add("card");
        card.setMaxWidth(500);

        Label nameLabel = new Label("Full Name: " + currentUser.getFullName());
        Label userLabel = new Label("Username: " + currentUser.getUsername());
        Label emailLabel = new Label("Email: " + currentUser.getEmail());
        Label phoneLabel = new Label("Phone: " + currentUser.getPhone());
        Label locLabel = new Label("Location: " + (currentUser.getLocation() != null ? currentUser.getLocation() : "Not specified"));
        Label roleLabel = new Label("Role: " + currentUser.getRole().getDisplayName());

        card.getChildren().addAll(nameLabel, userLabel, emailLabel, phoneLabel, locLabel, roleLabel);
        contentArea.getChildren().addAll(title, card);
    }
}
