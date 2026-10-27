package com.disastermanagement.view;

import com.disastermanagement.dao.*;
import com.disastermanagement.model.*;
import com.disastermanagement.service.ReportExportService;
import com.disastermanagement.util.UIUtils;
import com.disastermanagement.util.ValidationUtil;
import com.disastermanagement.view.components.*;

import javafx.beans.property.SimpleStringProperty;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.chart.*;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.stage.Stage;

import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class AdminDashboard {
    private final Stage stage;
    private final User currentUser;

    private final UserDAO userDAO = new UserDAO();
    private final DisasterReportDAO disasterDAO = new DisasterReportDAO();
    private final RescueRequestDAO rescueDAO = new RescueRequestDAO();
    private final RescueTeamDAO teamDAO = new RescueTeamDAO();
    private final ShelterDAO shelterDAO = new ShelterDAO();
    private final VolunteerDAO volunteerDAO = new VolunteerDAO();
    private final VolunteerTaskDAO taskDAO = new VolunteerTaskDAO();
    private final MissingPersonDAO missingDAO = new MissingPersonDAO();
    private final EmergencyAlertDAO alertDAO = new EmergencyAlertDAO();
    private final EmergencyContactDAO contactDAO = new EmergencyContactDAO();
    private final NotificationDAO notificationDAO = new NotificationDAO();

    private BorderPane mainLayout;
    private VBox contentArea;

    public AdminDashboard(Stage stage) {
        this.stage = stage;
        this.currentUser = com.disastermanagement.service.AuthService.getCurrentUser();
    }

    public AdminDashboard(Stage stage, User currentUser, Runnable ignored) {
        this.stage = stage;
        this.currentUser = currentUser != null ? currentUser : com.disastermanagement.service.AuthService.getCurrentUser();
    }

    public void show() {
        mainLayout = new BorderPane();
        mainLayout.getStyleClass().add("root");

        HeaderBar header = new HeaderBar(currentUser, () -> {
            com.disastermanagement.service.AuthService.logout();
            new LandingView(stage).show();
        });
        mainLayout.setTop(header);

        Sidebar sidebar = new Sidebar("Administrator");
        sidebar.addNavItem("overview", "📊 Command Center Overview", k -> showOverview());
        sidebar.addNavItem("map", "🗺 Disaster Map & Severity Grid", k -> showMapView());
        sidebar.addNavItem("users", "👥 User Management", k -> showUserManagement());
        sidebar.addNavItem("disasters", "🚨 Disaster Reports", k -> showDisasterManagement());
        sidebar.addNavItem("rescues", "🆘 Rescue Management", k -> showRescueManagement());
        sidebar.addNavItem("shelters", "🏠 Shelter Management", k -> showShelterManagement());
        sidebar.addNavItem("volunteers", "🤝 Volunteer Tasks", k -> showVolunteerManagement());
        sidebar.addNavItem("missing", "🔍 Missing Persons", k -> showMissingPersonManagement());
        sidebar.addNavItem("alerts", "📢 Emergency Alerts", k -> showAlertManagement());
        sidebar.addNavItem("contacts", "📞 Helpline Contacts", k -> showContactManagement());
        sidebar.addNavItem("viva", "💡 Smart Features (Viva)", k -> new InnovationFeaturesView(stage).show());

        mainLayout.setLeft(sidebar);

        contentArea = new VBox(20);
        contentArea.setPadding(new Insets(24));

        ScrollPane scrollPane = new ScrollPane(contentArea);
        scrollPane.setFitToWidth(true);
        scrollPane.setStyle("-fx-background-color: transparent; -fx-background: #F8FAFC;");
        mainLayout.setCenter(scrollPane);

        sidebar.setActive("overview");
        showOverview();

        Scene scene = new Scene(mainLayout, 1250, 800);
        scene.getStylesheets().add(getClass().getResource("/css/styles.css").toExternalForm());
        stage.setScene(scene);
        stage.setTitle("D-MERS - Administrator Control Console");
        stage.show();
    }

    private void showOverview() {
        contentArea.getChildren().clear();

        HBox topRow = new HBox();
        topRow.setAlignment(Pos.CENTER_LEFT);

        VBox titleBox = new VBox(4);
        Label title = new Label("System Command & Operations Center");
        title.getStyleClass().add("h1");
        Label sub = new Label("Real-time disaster telemetry, smart priority analytics, and emergency decision support.");
        sub.getStyleClass().add("subtitle");
        titleBox.getChildren().addAll(title, sub);

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        Button exportBtn = new Button("📥 Export Comprehensive CSV Report");
        exportBtn.getStyleClass().addAll("button", "button-success");
        exportBtn.setOnAction(e -> {
            try {
                File file = ReportExportService.exportSummaryReport();
                UIUtils.showInformation("Report Exported", "Summary Report exported successfully to:\n" + file.getAbsolutePath());
            } catch (Exception ex) {
                UIUtils.showError("Export Failed", ex.getMessage());
            }
        });

        topRow.getChildren().addAll(titleBox, spacer, exportBtn);

        // Stat KPI Cards Row
        HBox statsBox = new HBox(15,
                new StatCard("Total System Users", String.valueOf(userDAO.getTotalUsersCount()), "#2563EB"),
                new StatCard("Active Disasters", String.valueOf(disasterDAO.getActiveDisastersCount()), "#DC2626"),
                new StatCard("Pending Rescues", String.valueOf(rescueDAO.getPendingCount()), "#EA580C"),
                new StatCard("Completed Rescues", String.valueOf(rescueDAO.getCompletedCount()), "#059669"),
                new StatCard("Available Shelters", String.valueOf(shelterDAO.getAvailableSheltersCount()), "#0284C7"),
                new StatCard("Volunteers Registered", String.valueOf(volunteerDAO.getVolunteerCount()), "#7C3AED")
        );

        // Visual JavaFX Charts Row
        HBox chartsBox = new HBox(20);

        // 1. PieChart: Disaster Types
        PieChart disasterPieChart = new PieChart();
        disasterPieChart.setTitle("Disaster Type Breakdown");
        disasterPieChart.getStyleClass().add("chart");
        disasterPieChart.setPrefSize(450, 300);

        Map<String, Integer> typeCounts = new HashMap<>();
        for (DisasterReport report : disasterDAO.getAllReports()) {
            String lbl = report.getDisasterType();
            typeCounts.put(lbl, typeCounts.getOrDefault(lbl, 0) + 1);
        }
        ObservableList<PieChart.Data> pieData = FXCollections.observableArrayList();
        typeCounts.forEach((type, count) -> pieData.add(new PieChart.Data(type + " (" + count + ")", count)));
        disasterPieChart.setData(pieData);

        // 2. BarChart: Rescue Request Status Distribution
        CategoryAxis xAxis = new CategoryAxis();
        xAxis.setLabel("Rescue Status");
        NumberAxis yAxis = new NumberAxis();
        yAxis.setLabel("Count");

        BarChart<String, Number> rescueBarChart = new BarChart<>(xAxis, yAxis);
        rescueBarChart.setTitle("Rescue Request Status Distribution");
        rescueBarChart.getStyleClass().add("chart");
        rescueBarChart.setPrefSize(450, 300);
        rescueBarChart.setLegendVisible(false);

        XYChart.Series<String, Number> series = new XYChart.Series<>();
        Map<String, Integer> rescueCounts = new HashMap<>();
        for (RescueRequest req : rescueDAO.getAllRequestsSortedByPriority()) {
            String st = req.getStatus().name();
            rescueCounts.put(st, rescueCounts.getOrDefault(st, 0) + 1);
        }
        rescueCounts.forEach((st, count) -> series.getData().add(new XYChart.Data<>(st, count)));
        rescueBarChart.getData().add(series);

        VBox chartCard1 = new VBox(disasterPieChart);
        chartCard1.getStyleClass().add("card");
        HBox.setHgrow(chartCard1, Priority.ALWAYS);

        VBox chartCard2 = new VBox(rescueBarChart);
        chartCard2.getStyleClass().add("card");
        HBox.setHgrow(chartCard2, Priority.ALWAYS);

        chartsBox.getChildren().addAll(chartCard1, chartCard2);

        contentArea.getChildren().addAll(topRow, statsBox, chartsBox);
    }

    private void showMapView() {
        contentArea.getChildren().clear();
        Label title = new Label("Unified Disaster Monitoring & Severity Grid");
        title.getStyleClass().add("h1");

        DisasterMapView mapView = new DisasterMapView();
        VBox mapContainer = mapView.createMapViewNode();
        contentArea.getChildren().addAll(title, mapContainer);
    }

    private void showUserManagement() {
        contentArea.getChildren().clear();

        Label title = new Label("User Management Console");
        title.getStyleClass().add("h1");

        HBox topBox = new HBox(12);
        TextField searchField = new TextField();
        searchField.setPromptText("Search user by name, email, or role...");

        Button addUserBtn = new Button("+ Add User");
        addUserBtn.getStyleClass().addAll("button", "button-success");
        addUserBtn.setOnAction(e -> showAddUserDialog());

        topBox.getChildren().addAll(searchField, addUserBtn);

        TableView<User> table = new TableView<>();
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);

        TableColumn<User, String> idCol = new TableColumn<>("ID");
        idCol.setCellValueFactory(c -> new SimpleStringProperty("#" + c.getValue().getId()));

        TableColumn<User, String> nameCol = new TableColumn<>("Full Name");
        nameCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getFullName()));

        TableColumn<User, String> userCol = new TableColumn<>("Username");
        userCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getUsername()));

        TableColumn<User, String> emailCol = new TableColumn<>("Email");
        emailCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getEmail()));

        TableColumn<User, String> phoneCol = new TableColumn<>("Phone");
        phoneCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getPhone()));

        TableColumn<User, String> roleCol = new TableColumn<>("Role");
        roleCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getRole().getDisplayName()));

        table.getColumns().addAll(idCol, nameCol, userCol, emailCol, phoneCol, roleCol);

        List<User> allUsers = userDAO.getAllUsers();
        table.getItems().addAll(allUsers);

        searchField.textProperty().addListener((obs, oldVal, newVal) -> {
            table.getItems().clear();
            if (newVal == null || newVal.trim().isEmpty()) {
                table.getItems().addAll(allUsers);
            } else {
                String term = newVal.toLowerCase().trim();
                for (User u : allUsers) {
                    if (u.getFullName().toLowerCase().contains(term) ||
                        u.getUsername().toLowerCase().contains(term) ||
                        u.getEmail().toLowerCase().contains(term) ||
                        u.getRole().getDisplayName().toLowerCase().contains(term)) {
                        table.getItems().add(u);
                    }
                }
            }
        });

        HBox actions = new HBox(12);
        Button deleteBtn = new Button("Delete Selected User");
        deleteBtn.getStyleClass().addAll("button", "button-danger");
        deleteBtn.setOnAction(e -> {
            User sel = table.getSelectionModel().getSelectedItem();
            if (sel != null) {
                if (sel.getId() == currentUser.getId()) {
                    UIUtils.showError("Operation Denied", "Cannot delete your active admin session.");
                    return;
                }
                if (UIUtils.showConfirm("Delete User", "Are you sure you want to delete user '" + sel.getUsername() + "'?")) {
                    userDAO.deleteUser(sel.getId());
                    showUserManagement();
                }
            }
        });

        actions.getChildren().add(deleteBtn);
        contentArea.getChildren().addAll(title, topBox, actions, table);
    }

    private void showAddUserDialog() {
        Dialog<Boolean> dialog = new Dialog<>();
        dialog.setTitle("Add System User");

        VBox form = new VBox(10);
        form.setPadding(new Insets(15));

        TextField nameField = new TextField(); nameField.setPromptText("Full Name");
        TextField usernameField = new TextField(); usernameField.setPromptText("Username");
        TextField emailField = new TextField(); emailField.setPromptText("Email Address");
        TextField phoneField = new TextField(); phoneField.setPromptText("Phone Number");
        PasswordField passwordField = new PasswordField(); passwordField.setPromptText("Password");

        ComboBox<UserRole> roleCombo = new ComboBox<>();
        roleCombo.getItems().addAll(UserRole.values());
        roleCombo.setValue(UserRole.CITIZEN);

        form.getChildren().addAll(
                new Label("Full Name"), nameField,
                new Label("Username"), usernameField,
                new Label("Email"), emailField,
                new Label("Phone"), phoneField,
                new Label("Password"), passwordField,
                new Label("Role"), roleCombo
        );

        dialog.getDialogPane().setContent(form);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        dialog.setResultConverter(btn -> {
            if (btn == ButtonType.OK) {
                try {
                    com.disastermanagement.service.AuthService authService = new com.disastermanagement.service.AuthService();
                    return authService.register(
                            usernameField.getText(),
                            passwordField.getText(),
                            nameField.getText(),
                            emailField.getText(),
                            phoneField.getText(),
                            roleCombo.getValue()
                    );
                } catch (Exception ex) {
                    UIUtils.showError("Error Creating User", ex.getMessage());
                    return false;
                }
            }
            return false;
        });

        dialog.showAndWait().ifPresent(ok -> {
            if (ok) {
                UIUtils.showInformation("Success", "User created successfully.");
                showUserManagement();
            }
        });
    }

    private void showDisasterManagement() {
        contentArea.getChildren().clear();

        Label title = new Label("Disaster Incident Administration");
        title.getStyleClass().add("h1");

        TableView<DisasterReport> table = new TableView<>();
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);

        TableColumn<DisasterReport, String> idCol = new TableColumn<>("ID");
        idCol.setCellValueFactory(c -> new SimpleStringProperty("#" + c.getValue().getReportId()));

        TableColumn<DisasterReport, String> citizenCol = new TableColumn<>("Citizen");
        citizenCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getCitizenName() != null ? c.getValue().getCitizenName() : "Citizen #" + c.getValue().getCitizenId()));

        TableColumn<DisasterReport, String> typeCol = new TableColumn<>("Type");
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

        TableColumn<DisasterReport, String> statusCol = new TableColumn<>("Status");
        statusCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getStatus()));
        statusCol.setCellFactory(col -> new TableCell<>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) setGraphic(null);
                else setGraphic(new StatusBadge(item, "status"));
            }
        });

        table.getColumns().addAll(idCol, citizenCol, typeCol, locCol, sevCol, statusCol);
        table.getItems().addAll(disasterDAO.getAllReports());

        HBox actions = new HBox(12);
        Button verifyBtn = new Button("Mark Verified");
        verifyBtn.getStyleClass().addAll("button", "button-primary");
        verifyBtn.setOnAction(e -> {
            DisasterReport sel = table.getSelectionModel().getSelectedItem();
            if (sel != null) {
                disasterDAO.updateStatus(sel.getReportId(), DisasterReport.ReportStatus.VERIFIED);
                showDisasterManagement();
            }
        });

        Button resolveBtn = new Button("Mark Resolved ✔");
        resolveBtn.getStyleClass().addAll("button", "button-success");
        resolveBtn.setOnAction(e -> {
            DisasterReport sel = table.getSelectionModel().getSelectedItem();
            if (sel != null) {
                disasterDAO.updateStatus(sel.getReportId(), DisasterReport.ReportStatus.RESOLVED);
                showDisasterManagement();
            }
        });

        Button deleteBtn = new Button("Delete Invalid Report");
        deleteBtn.getStyleClass().addAll("button", "button-danger");
        deleteBtn.setOnAction(e -> {
            DisasterReport sel = table.getSelectionModel().getSelectedItem();
            if (sel != null && UIUtils.showConfirm("Delete Report", "Delete report #" + sel.getReportId() + "?")) {
                disasterDAO.deleteReport(sel.getReportId());
                showDisasterManagement();
            }
        });

        actions.getChildren().addAll(verifyBtn, resolveBtn, deleteBtn);
        contentArea.getChildren().addAll(title, actions, table);
    }

    private void showRescueManagement() {
        contentArea.getChildren().clear();

        Label title = new Label("Rescue Operations Management");
        title.getStyleClass().add("h1");

        TableView<RescueRequest> table = new TableView<>();
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);

        TableColumn<RescueRequest, String> idCol = new TableColumn<>("Request ID");
        idCol.setCellValueFactory(c -> new SimpleStringProperty("#" + c.getValue().getRequestId()));

        TableColumn<RescueRequest, String> citizenCol = new TableColumn<>("Citizen");
        citizenCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getCitizenName() != null ? c.getValue().getCitizenName() : "Citizen #" + c.getValue().getCitizenId()));

        TableColumn<RescueRequest, String> contactCol = new TableColumn<>("Contact");
        contactCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getContactNumber()));

        TableColumn<RescueRequest, String> locCol = new TableColumn<>("Location");
        locCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getLocation()));

        TableColumn<RescueRequest, String> prioCol = new TableColumn<>("Smart Priority");
        prioCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getPriorityScore() + "/100 (" + c.getValue().getPriority().name() + ")"));
        prioCol.setCellFactory(col -> new TableCell<>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) setGraphic(null);
                else setGraphic(new StatusBadge(item, "severity"));
            }
        });

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
        teamCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getAssignedTeamName() != null ? c.getValue().getAssignedTeamName() : "Unassigned"));

        table.getColumns().addAll(idCol, citizenCol, contactCol, locCol, prioCol, statusCol, teamCol);
        table.getItems().addAll(rescueDAO.getAllRequestsSortedByPriority());

        HBox actions = new HBox(12);

        Button assignBtn = new Button("Assign Rescue Team");
        assignBtn.getStyleClass().addAll("button", "button-warning");
        assignBtn.setOnAction(e -> {
            RescueRequest sel = table.getSelectionModel().getSelectedItem();
            if (sel != null) {
                showAssignTeamDialog(sel);
            }
        });

        Button completeBtn = new Button("Mark Completed");
        completeBtn.getStyleClass().addAll("button", "button-success");
        completeBtn.setOnAction(e -> {
            RescueRequest sel = table.getSelectionModel().getSelectedItem();
            if (sel != null) {
                rescueDAO.updateStatusAndTeam(sel.getRequestId(), RescueRequest.RequestStatus.COMPLETED, sel.getAssignedTeamId(), "Admin HQ", "Marked completed by Admin.");
                showRescueManagement();
            }
        });

        actions.getChildren().addAll(assignBtn, completeBtn);
        contentArea.getChildren().addAll(title, actions, table);
    }

    private void showAssignTeamDialog(RescueRequest request) {
        Dialog<RescueTeam> dialog = new Dialog<>();
        dialog.setTitle("Assign Rescue Team to SOS #" + request.getRequestId());

        VBox box = new VBox(10);
        box.setPadding(new Insets(15));

        ComboBox<RescueTeam> teamCombo = new ComboBox<>();
        teamCombo.getItems().addAll(teamDAO.getAllTeams());
        if (!teamCombo.getItems().isEmpty()) teamCombo.setValue(teamCombo.getItems().get(0));

        box.getChildren().addAll(new Label("Select Rescue Team:"), teamCombo);
        dialog.getDialogPane().setContent(box);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        dialog.setResultConverter(btn -> btn == ButtonType.OK ? teamCombo.getValue() : null);

        dialog.showAndWait().ifPresent(team -> {
            if (team != null) {
                rescueDAO.updateStatusAndTeam(request.getRequestId(), RescueRequest.RequestStatus.ASSIGNED, team.getTeamId(), "Admin HQ", "Assigned to " + team.getTeamName());
                UIUtils.showInformation("Team Assigned", "Assigned team " + team.getTeamName() + " to Request #" + request.getRequestId());
                showRescueManagement();
            }
        });
    }

    private void showShelterManagement() {
        contentArea.getChildren().clear();

        Label title = new Label("Shelter Capacity Intelligence Console");
        title.getStyleClass().add("h1");

        Button addShelterBtn = new Button("+ Add New Shelter");
        addShelterBtn.getStyleClass().addAll("button", "button-success");
        addShelterBtn.setOnAction(e -> showAddShelterDialog());

        TableView<Shelter> table = new TableView<>();
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);

        TableColumn<Shelter, String> nameCol = new TableColumn<>("Name");
        nameCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getName()));

        TableColumn<Shelter, String> locCol = new TableColumn<>("Location");
        locCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getLocation()));

        TableColumn<Shelter, String> capCol = new TableColumn<>("Capacity");
        capCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getCapacity() + " Max"));

        TableColumn<Shelter, String> occCol = new TableColumn<>("Occupancy");
        occCol.setCellValueFactory(c -> new SimpleStringProperty(String.valueOf(c.getValue().getCurrentOccupancy())));

        TableColumn<Shelter, String> availCol = new TableColumn<>("Available");
        availCol.setCellValueFactory(c -> new SimpleStringProperty(String.valueOf(c.getValue().getAvailableSpaces())));

        TableColumn<Shelter, String> statusCol = new TableColumn<>("Status");
        statusCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getOccupancyStatus()));

        table.getColumns().addAll(nameCol, locCol, capCol, occCol, availCol, statusCol);
        table.getItems().addAll(shelterDAO.getAllShelters());

        HBox actions = new HBox(12);

        Button updateOccBtn = new Button("Update Occupancy");
        updateOccBtn.getStyleClass().addAll("button", "button-primary");
        updateOccBtn.setOnAction(e -> {
            Shelter sel = table.getSelectionModel().getSelectedItem();
            if (sel != null) {
                TextInputDialog tid = new TextInputDialog(String.valueOf(sel.getCurrentOccupancy()));
                tid.setTitle("Update Occupancy");
                tid.setHeaderText("Set current occupancy for " + sel.getName());
                tid.setContentText("Current Occupancy:");
                tid.showAndWait().ifPresent(val -> {
                    if (ValidationUtil.isPositiveInteger(val)) {
                        int occ = Integer.parseInt(val);
                        if (occ > sel.getCapacity()) {
                            UIUtils.showError("Invalid Input", "Occupancy cannot exceed capacity (" + sel.getCapacity() + ")");
                            return;
                        }
                        sel.setCurrentOccupancy(occ);
                        shelterDAO.updateShelter(sel);
                        showShelterManagement();
                    }
                });
            }
        });

        Button deleteBtn = new Button("Delete Shelter");
        deleteBtn.getStyleClass().addAll("button", "button-danger");
        deleteBtn.setOnAction(e -> {
            Shelter sel = table.getSelectionModel().getSelectedItem();
            if (sel != null && UIUtils.showConfirm("Delete Shelter", "Delete shelter " + sel.getName() + "?")) {
                shelterDAO.deleteShelter(sel.getShelterId());
                showShelterManagement();
            }
        });

        actions.getChildren().addAll(addShelterBtn, updateOccBtn, deleteBtn);
        contentArea.getChildren().addAll(title, actions, table);
    }

    private void showAddShelterDialog() {
        Dialog<Shelter> dialog = new Dialog<>();
        dialog.setTitle("Add Emergency Shelter");

        VBox form = new VBox(10);
        form.setPadding(new Insets(15));

        TextField nameField = new TextField(); nameField.setPromptText("Shelter Name");
        TextField locField = new TextField(); locField.setPromptText("Location Address");
        TextField capField = new TextField(); capField.setPromptText("Total Capacity");
        TextField phoneField = new TextField(); phoneField.setPromptText("Contact Number");

        CheckBox foodCb = new CheckBox("Food Supply Available"); foodCb.setSelected(true);
        CheckBox waterCb = new CheckBox("Clean Water Available"); waterCb.setSelected(true);
        CheckBox medCb = new CheckBox("Medical Facility Available"); medCb.setSelected(true);

        form.getChildren().addAll(
                new Label("Shelter Name"), nameField,
                new Label("Location"), locField,
                new Label("Total Capacity"), capField,
                new Label("Contact Phone"), phoneField,
                foodCb, waterCb, medCb
        );

        dialog.getDialogPane().setContent(form);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        dialog.setResultConverter(btn -> {
            if (btn == ButtonType.OK) {
                if (!ValidationUtil.isPositiveInteger(capField.getText())) {
                    UIUtils.showError("Invalid Input", "Capacity must be a positive integer.");
                    return null;
                }
                Shelter s = new Shelter();
                s.setName(nameField.getText().trim());
                s.setLocation(locField.getText().trim());
                s.setCapacity(Integer.parseInt(capField.getText().trim()));
                s.setCurrentOccupancy(0);
                s.setContactNumber(phoneField.getText().trim());
                s.setFoodAvailable(foodCb.isSelected());
                s.setWaterAvailable(waterCb.isSelected());
                s.setMedicalFacility(medCb.isSelected());
                return s;
            }
            return null;
        });

        dialog.showAndWait().ifPresent(s -> {
            if (s != null) {
                shelterDAO.createShelter(s);
                showShelterManagement();
            }
        });
    }

    private void showVolunteerManagement() {
        contentArea.getChildren().clear();

        Label title = new Label("Volunteer Task Administration");
        title.getStyleClass().add("h1");

        Button addTaskBtn = new Button("+ Create New Relief Task");
        addTaskBtn.getStyleClass().addAll("button", "button-success");
        addTaskBtn.setOnAction(e -> showCreateTaskDialog());

        TableView<VolunteerTask> table = new TableView<>();
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);

        TableColumn<VolunteerTask, String> idCol = new TableColumn<>("Task ID");
        idCol.setCellValueFactory(c -> new SimpleStringProperty("#" + c.getValue().getTaskId()));

        TableColumn<VolunteerTask, String> titleCol = new TableColumn<>("Task Title");
        titleCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getTitle()));

        TableColumn<VolunteerTask, String> locCol = new TableColumn<>("Location");
        locCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getLocation()));

        TableColumn<VolunteerTask, String> skillCol = new TableColumn<>("Required Skill");
        skillCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getRequiredSkill().getLabel()));

        TableColumn<VolunteerTask, String> volCol = new TableColumn<>("Assigned Volunteer");
        volCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getAssignedVolunteerName() != null ? c.getValue().getAssignedVolunteerName() : "Unassigned"));

        TableColumn<VolunteerTask, String> statusCol = new TableColumn<>("Status");
        statusCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getStatus().name()));

        table.getColumns().addAll(idCol, titleCol, locCol, skillCol, volCol, statusCol);
        table.getItems().addAll(taskDAO.getAllTasks());

        contentArea.getChildren().addAll(title, addTaskBtn, table);
    }

    private void showCreateTaskDialog() {
        Dialog<VolunteerTask> dialog = new Dialog<>();
        dialog.setTitle("Create Relief Task");

        VBox form = new VBox(10);
        form.setPadding(new Insets(15));

        TextField titleField = new TextField(); titleField.setPromptText("Task Title");
        TextArea descArea = new TextArea(); descArea.setPromptText("Task Description");
        TextField locField = new TextField(); locField.setPromptText("Location");

        ComboBox<Volunteer.Skill> skillCombo = new ComboBox<>();
        skillCombo.getItems().addAll(Volunteer.Skill.values());
        skillCombo.setValue(Volunteer.Skill.FIRST_AID);

        form.getChildren().addAll(
                new Label("Title"), titleField,
                new Label("Description"), descArea,
                new Label("Location"), locField,
                new Label("Required Skill"), skillCombo
        );

        dialog.getDialogPane().setContent(form);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        dialog.setResultConverter(btn -> {
            if (btn == ButtonType.OK) {
                VolunteerTask vt = new VolunteerTask();
                vt.setTitle(titleField.getText().trim());
                vt.setDescription(descArea.getText().trim());
                vt.setLocation(locField.getText().trim());
                vt.setRequiredSkill(skillCombo.getValue());
                vt.setStatus(VolunteerTask.TaskStatus.OPEN);
                return vt;
            }
            return null;
        });

        dialog.showAndWait().ifPresent(task -> {
            if (task != null) {
                taskDAO.createTask(task);
                showVolunteerManagement();
            }
        });
    }

    private void showMissingPersonManagement() {
        contentArea.getChildren().clear();

        Label title = new Label("Missing Persons Administration");
        title.getStyleClass().add("h1");

        TableView<MissingPerson> table = new TableView<>();
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);

        TableColumn<MissingPerson, String> nameCol = new TableColumn<>("Name");
        nameCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getName()));

        TableColumn<MissingPerson, String> ageCol = new TableColumn<>("Age/Gender");
        ageCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getAge() + " / " + c.getValue().getGender().name()));

        TableColumn<MissingPerson, String> locCol = new TableColumn<>("Last Seen Location");
        locCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getLastSeenLocation()));

        TableColumn<MissingPerson, String> contactCol = new TableColumn<>("Contact");
        contactCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getContactInfo()));

        TableColumn<MissingPerson, String> statusCol = new TableColumn<>("Status");
        statusCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getStatus().name()));

        table.getColumns().addAll(nameCol, ageCol, locCol, contactCol, statusCol);
        table.getItems().addAll(missingDAO.getAllReports());

        HBox actions = new HBox(12);
        Button foundBtn = new Button("Mark Found ✔");
        foundBtn.getStyleClass().addAll("button", "button-success");
        foundBtn.setOnAction(e -> {
            MissingPerson sel = table.getSelectionModel().getSelectedItem();
            if (sel != null) {
                missingDAO.updateStatus(sel.getPersonId(), MissingPerson.PersonStatus.FOUND);
                showMissingPersonManagement();
            }
        });

        actions.getChildren().add(foundBtn);
        contentArea.getChildren().addAll(title, actions, table);
    }

    private void showAlertManagement() {
        contentArea.getChildren().clear();

        Label title = new Label("Emergency Alert Broadcast Console");
        title.getStyleClass().add("h1");

        Button publishBtn = new Button("📢 Broadcast Emergency Alert");
        publishBtn.getStyleClass().addAll("button", "button-danger");
        publishBtn.setOnAction(e -> showPublishAlertDialog());

        TableView<EmergencyAlert> table = new TableView<>();
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);

        TableColumn<EmergencyAlert, String> titleCol = new TableColumn<>("Alert Title");
        titleCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getTitle()));

        TableColumn<EmergencyAlert, String> typeCol = new TableColumn<>("Disaster Type");
        typeCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getDisasterType().getLabel()));

        TableColumn<EmergencyAlert, String> sevCol = new TableColumn<>("Severity");
        sevCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getSeverity().getLabel()));

        TableColumn<EmergencyAlert, String> msgCol = new TableColumn<>("Message");
        msgCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getMessage()));

        table.getColumns().addAll(titleCol, typeCol, sevCol, msgCol);
        table.getItems().addAll(alertDAO.getAllAlerts());

        contentArea.getChildren().addAll(title, publishBtn, table);
    }

    private void showPublishAlertDialog() {
        Dialog<EmergencyAlert> dialog = new Dialog<>();
        dialog.setTitle("Broadcast Emergency Alert");

        VBox form = new VBox(10);
        form.setPadding(new Insets(15));

        TextField titleField = new TextField(); titleField.setPromptText("Alert Title (e.g. CRITICAL FLOOD WARNING)");
        TextArea msgArea = new TextArea(); msgArea.setPromptText("Emergency Message to broadcast to all citizens...");

        ComboBox<DisasterReport.DisasterType> typeCombo = new ComboBox<>();
        typeCombo.getItems().addAll(DisasterReport.DisasterType.values());
        typeCombo.setValue(DisasterReport.DisasterType.FLOOD);

        ComboBox<DisasterReport.Severity> sevCombo = new ComboBox<>();
        sevCombo.getItems().addAll(DisasterReport.Severity.values());
        sevCombo.setValue(DisasterReport.Severity.CRITICAL);

        form.getChildren().addAll(
                new Label("Alert Title"), titleField,
                new Label("Disaster Type"), typeCombo,
                new Label("Severity Level"), sevCombo,
                new Label("Broadcast Message"), msgArea
        );

        dialog.getDialogPane().setContent(form);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        dialog.setResultConverter(btn -> {
            if (btn == ButtonType.OK) {
                EmergencyAlert a = new EmergencyAlert();
                a.setTitle(titleField.getText().trim());
                a.setMessage(msgArea.getText().trim());
                a.setDisasterType(typeCombo.getValue());
                a.setSeverity(sevCombo.getValue());
                a.setActive(true);
                return a;
            }
            return null;
        });

        dialog.showAndWait().ifPresent(alert -> {
            if (alert != null) {
                alertDAO.createAlert(alert);
                // Also create broadcast notifications for users
                for (User u : userDAO.getAllUsers()) {
                    notificationDAO.createNotification(new Notification(u.getId(), alert.getTitle(), alert.getMessage()));
                }
                UIUtils.showInformation("Alert Published", "Emergency alert broadcasted live!");
                showAlertManagement();
            }
        });
    }

    private void showContactManagement() {
        contentArea.getChildren().clear();

        Label title = new Label("Emergency Contacts & Helplines Administration");
        title.getStyleClass().add("h1");

        Button addContactBtn = new Button("+ Add Helpline Contact");
        addContactBtn.getStyleClass().addAll("button", "button-success");
        addContactBtn.setOnAction(e -> showAddContactDialog());

        TableView<EmergencyContact> table = new TableView<>();
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);

        TableColumn<EmergencyContact, String> catCol = new TableColumn<>("Category");
        catCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getCategory()));

        TableColumn<EmergencyContact, String> titleCol = new TableColumn<>("Title");
        titleCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getTitle()));

        TableColumn<EmergencyContact, String> phoneCol = new TableColumn<>("Phone Number");
        phoneCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getPhoneNumber()));

        TableColumn<EmergencyContact, String> locCol = new TableColumn<>("Location");
        locCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getLocation()));

        table.getColumns().addAll(catCol, titleCol, phoneCol, locCol);
        table.getItems().addAll(contactDAO.getAllContacts());

        contentArea.getChildren().addAll(title, addContactBtn, table);
    }

    private void showAddContactDialog() {
        Dialog<EmergencyContact> dialog = new Dialog<>();
        dialog.setTitle("Add Helpline Contact");

        VBox form = new VBox(10);
        form.setPadding(new Insets(15));

        TextField catField = new TextField(); catField.setPromptText("Category (e.g. Police, Fire, Ambulance)");
        TextField titleField = new TextField(); titleField.setPromptText("Helpline Name");
        TextField phoneField = new TextField(); phoneField.setPromptText("Phone Number");
        TextField locField = new TextField(); locField.setPromptText("Location / Region");
        TextField notesField = new TextField(); notesField.setPromptText("Notes / Operating Hours");

        form.getChildren().addAll(
                new Label("Category"), catField,
                new Label("Title"), titleField,
                new Label("Phone Number"), phoneField,
                new Label("Location"), locField,
                new Label("Notes"), notesField
        );

        dialog.getDialogPane().setContent(form);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        dialog.setResultConverter(btn -> {
            if (btn == ButtonType.OK) {
                return new EmergencyContact(
                        catField.getText().trim(),
                        titleField.getText().trim(),
                        phoneField.getText().trim(),
                        locField.getText().trim(),
                        notesField.getText().trim()
                );
            }
            return null;
        });

        dialog.showAndWait().ifPresent(ec -> {
            if (ec != null) {
                contactDAO.addContact(ec);
                showContactManagement();
            }
        });
    }
}
