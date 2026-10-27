package com.disastermanagement.view;

import com.disastermanagement.dao.*;
import com.disastermanagement.model.*;
import com.disastermanagement.smart.VolunteerMatchingService;
import com.disastermanagement.util.UIUtils;
import com.disastermanagement.view.components.*;

import javafx.beans.property.SimpleStringProperty;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.stage.Stage;

import java.util.List;

public class VolunteerDashboard {
    private final Stage stage;
    private final User currentUser;

    private final VolunteerDAO volunteerDAO = new VolunteerDAO();
    private final VolunteerTaskDAO taskDAO = new VolunteerTaskDAO();
    private final DisasterReportDAO disasterDAO = new DisasterReportDAO();

    private BorderPane mainLayout;
    private VBox contentArea;
    private Volunteer volunteer;

    public VolunteerDashboard(Stage stage) {
        this.stage = stage;
        this.currentUser = com.disastermanagement.service.AuthService.getCurrentUser();
        this.volunteer = volunteerDAO.findByUserId(currentUser.getId());
    }

    public VolunteerDashboard(Stage stage, User currentUser, Runnable ignored) {
        this.stage = stage;
        this.currentUser = currentUser != null ? currentUser : com.disastermanagement.service.AuthService.getCurrentUser();
        this.volunteer = volunteerDAO.findByUserId(this.currentUser.getId());
    }

    public void show() {
        mainLayout = new BorderPane();
        mainLayout.getStyleClass().add("root");

        HeaderBar header = new HeaderBar(currentUser, () -> {
            com.disastermanagement.service.AuthService.logout();
            new LandingView(stage).show();
        });
        mainLayout.setTop(header);

        Sidebar sidebar = new Sidebar("Volunteer");
        sidebar.addNavItem("recommended", "⚡ Recommended Tasks (Smart Match)", k -> showRecommendedTasksView());
        sidebar.addNavItem("all_tasks", "📋 All Open Relief Tasks", k -> showReliefTasksView());
        sidebar.addNavItem("disasters", "🗺 Active Disaster Incidents", k -> showDisasterInfoView());
        sidebar.addNavItem("viva", "💡 Smart Features (Viva)", k -> new InnovationFeaturesView(stage).show());
        sidebar.addNavItem("profile", "👤 Skill Profile & Availability", k -> showProfileView());

        mainLayout.setLeft(sidebar);

        contentArea = new VBox(20);
        contentArea.setPadding(new Insets(24));

        ScrollPane scrollPane = new ScrollPane(contentArea);
        scrollPane.setFitToWidth(true);
        scrollPane.setStyle("-fx-background-color: transparent; -fx-background: #F8FAFC;");
        mainLayout.setCenter(scrollPane);

        sidebar.setActive("recommended");
        showRecommendedTasksView();

        Scene scene = new Scene(mainLayout, 1180, 780);
        scene.getStylesheets().add(getClass().getResource("/css/styles.css").toExternalForm());
        stage.setScene(scene);
        stage.setTitle("D-MERS - Volunteer Portal");
        stage.show();
    }

    private void showRecommendedTasksView() {
        contentArea.getChildren().clear();

        Label title = new Label("Smart Volunteer Matching - Recommended Tasks");
        title.getStyleClass().add("h1");

        Label sub = new Label("Rule-based matching engine ranks open tasks based on your registered skills, availability status, and location proximity.");
        sub.getStyleClass().add("subtitle");

        if (volunteer == null) {
            VBox warningBox = new VBox(10);
            warningBox.getStyleClass().add("alert-card-warning");
            Label wLabel = new Label("⚠️ Volunteer Profile Required: Please click 'Skill Profile' in the sidebar to register your emergency skills.");
            wLabel.setStyle("-fx-font-weight: bold; -fx-text-fill: #991B1B;");
            warningBox.getChildren().add(wLabel);
            contentArea.getChildren().addAll(title, sub, warningBox);
            return;
        }

        // Availability Toggle Banner
        HBox statusBanner = new HBox(15);
        statusBanner.getStyleClass().add("card");
        statusBanner.setAlignment(Pos.CENTER_LEFT);

        Label statusLabel = new Label("Current Status: " + volunteer.getAvailability().name());
        statusLabel.setStyle("-fx-font-size: 15px; -fx-font-weight: 800; -fx-text-fill: #1E3A8A;");

        Button toggleStatusBtn = new Button("Toggle Availability (Available / Busy / Unavailable)");
        toggleStatusBtn.getStyleClass().addAll("button", "button-primary");
        toggleStatusBtn.setOnAction(e -> {
            Volunteer.Availability next = (volunteer.getAvailability() == Volunteer.Availability.AVAILABLE) ? Volunteer.Availability.BUSY : Volunteer.Availability.AVAILABLE;
            volunteer.setAvailability(next);
            volunteerDAO.createOrUpdateVolunteer(volunteer);
            UIUtils.showInformation("Status Updated", "Your volunteer status is now " + next.name());
            showRecommendedTasksView();
        });

        statusBanner.getChildren().addAll(statusLabel, toggleStatusBtn);

        // List open tasks
        List<VolunteerTask> openTasks = taskDAO.getOpenOrAssignedTasks(volunteer.getVolunteerId());

        VBox tasksList = new VBox(14);
        for (VolunteerTask task : openTasks) {
            // Run Smart Volunteer Matching Engine for this task
            List<VolunteerMatchingService.VolunteerMatch> matches = VolunteerMatchingService.matchVolunteers(task, List.of(volunteer));
            int matchScore = matches.isEmpty() ? 50 : matches.get(0).getMatchScore();
            String matchReason = matches.isEmpty() ? "General match" : matches.get(0).getMatchReason();

            VBox taskCard = new VBox(10);
            taskCard.getStyleClass().add("card");

            HBox cardHeader = new HBox(15);
            cardHeader.setAlignment(Pos.CENTER_LEFT);

            Label tTitle = new Label(task.getTitle() + " (#" + task.getTaskId() + ")");
            tTitle.getStyleClass().add("h2");

            Label matchBadge = new Label("⚡ " + matchScore + "% MATCH");
            matchBadge.setStyle("-fx-background-color: " + (matchScore >= 80 ? "#059669" : matchScore >= 50 ? "#2563EB" : "#EA580C") + "; -fx-text-fill: white; -fx-padding: 4px 12px; -fx-background-radius: 12px; -fx-font-weight: bold;");

            StatusBadge statusBadge = new StatusBadge(task.getStatus().name(), "status");

            Region spacer = new Region();
            HBox.setHgrow(spacer, Priority.ALWAYS);

            Button acceptTaskBtn = new Button(task.getAssignedVolunteerId() != null && task.getAssignedVolunteerId().equals(volunteer.getVolunteerId()) ? "In Progress" : "Accept Task");
            acceptTaskBtn.getStyleClass().addAll("button", "button-success");
            acceptTaskBtn.setOnAction(ev -> {
                taskDAO.updateTaskStatus(task.getTaskId(), VolunteerTask.TaskStatus.ASSIGNED, volunteer.getVolunteerId());
                UIUtils.showInformation("Task Accepted", "You have accepted Task #" + task.getTaskId() + "!");
                showRecommendedTasksView();
            });

            cardHeader.getChildren().addAll(tTitle, matchBadge, statusBadge, spacer, acceptTaskBtn);

            Label tLoc = new Label("📍 Location: " + task.getLocation() + " | Required Skill: " + task.getRequiredSkill().getLabel());
            tLoc.setStyle("-fx-font-weight: bold; -fx-text-fill: #334155;");

            Label tDesc = new Label(task.getDescription());
            tDesc.setWrapText(true);

            Label matchExplanation = new Label("Match Factors:\n" + matchReason);
            matchExplanation.setStyle("-fx-font-size: 11px; -fx-text-fill: #64748B; -fx-background-color: #F1F5F9; -fx-padding: 8px; -fx-background-radius: 6px;");

            taskCard.getChildren().addAll(cardHeader, tLoc, tDesc, matchExplanation);
            tasksList.getChildren().add(taskCard);
        }

        contentArea.getChildren().addAll(title, sub, statusBanner, tasksList);
    }

    private void showReliefTasksView() {
        contentArea.getChildren().clear();

        Label title = new Label("All Relief & Support Tasks");
        title.getStyleClass().add("h1");

        int volId = volunteer != null ? volunteer.getVolunteerId() : 0;
        List<VolunteerTask> tasks = taskDAO.getOpenOrAssignedTasks(volId);

        TableView<VolunteerTask> table = new TableView<>();
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);

        TableColumn<VolunteerTask, String> idCol = new TableColumn<>("Task ID");
        idCol.setCellValueFactory(c -> new SimpleStringProperty("#" + c.getValue().getTaskId()));

        TableColumn<VolunteerTask, String> titleCol = new TableColumn<>("Title");
        titleCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getTitle()));

        TableColumn<VolunteerTask, String> locCol = new TableColumn<>("Location");
        locCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getLocation()));

        TableColumn<VolunteerTask, String> skillCol = new TableColumn<>("Required Skill");
        skillCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getRequiredSkill().getLabel()));

        TableColumn<VolunteerTask, String> statusCol = new TableColumn<>("Status");
        statusCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getStatus().name()));
        statusCol.setCellFactory(col -> new TableCell<>() {
            @Override
            protected void updateItem(String item, boolean empty) {
                super.updateItem(item, empty);
                if (empty || item == null) setGraphic(null);
                else setGraphic(new StatusBadge(item, "status"));
            }
        });

        table.getColumns().addAll(idCol, titleCol, locCol, skillCol, statusCol);
        table.getItems().addAll(tasks);

        HBox actions = new HBox(12);

        Button acceptBtn = new Button("Accept Task");
        acceptBtn.getStyleClass().addAll("button", "button-success");
        acceptBtn.setOnAction(e -> {
            VolunteerTask sel = table.getSelectionModel().getSelectedItem();
            if (sel == null) {
                UIUtils.showWarning("Selection Required", "Please select a task to accept.");
                return;
            }
            if (volunteer == null) {
                UIUtils.showError("Profile Required", "Please complete your volunteer profile first.");
                return;
            }
            taskDAO.updateTaskStatus(sel.getTaskId(), VolunteerTask.TaskStatus.ASSIGNED, volunteer.getVolunteerId());
            UIUtils.showInformation("Task Accepted", "Task #" + sel.getTaskId() + " assigned to you!");
            showReliefTasksView();
        });

        Button completeBtn = new Button("Mark Task Completed ✔");
        completeBtn.getStyleClass().addAll("button", "button-primary");
        completeBtn.setOnAction(e -> {
            VolunteerTask sel = table.getSelectionModel().getSelectedItem();
            if (sel != null && volunteer != null) {
                taskDAO.updateTaskStatus(sel.getTaskId(), VolunteerTask.TaskStatus.COMPLETED, volunteer.getVolunteerId());
                UIUtils.showInformation("Task Completed", "Thank you for your volunteer service!");
                showReliefTasksView();
            }
        });

        actions.getChildren().addAll(acceptBtn, completeBtn);
        contentArea.getChildren().addAll(title, actions, table);
    }

    private void showDisasterInfoView() {
        contentArea.getChildren().clear();

        Label title = new Label("Current Disaster Situation");
        title.getStyleClass().add("h1");

        TableView<DisasterReport> table = new TableView<>();
        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);

        TableColumn<DisasterReport, String> typeCol = new TableColumn<>("Disaster");
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

        TableColumn<DisasterReport, String> descCol = new TableColumn<>("Description");
        descCol.setCellValueFactory(c -> new SimpleStringProperty(c.getValue().getDescription()));

        table.getColumns().addAll(typeCol, locCol, sevCol, descCol);
        table.getItems().addAll(disasterDAO.getAllReports());

        contentArea.getChildren().addAll(title, table);
    }

    private void showProfileView() {
        contentArea.getChildren().clear();

        Label title = new Label("Volunteer Skill Profile & Settings");
        title.getStyleClass().add("h1");

        VBox formCard = new VBox(15);
        formCard.getStyleClass().add("card");
        formCard.setMaxWidth(550);

        TextField phoneField = new TextField(volunteer != null ? volunteer.getPhone() : currentUser.getPhone());
        phoneField.setPromptText("Phone Number");

        TextField emailField = new TextField(volunteer != null ? volunteer.getEmail() : currentUser.getEmail());
        emailField.setPromptText("Email Address");

        ComboBox<Volunteer.Skill> skillCombo = new ComboBox<>();
        skillCombo.getItems().addAll(Volunteer.Skill.values());
        skillCombo.setValue(volunteer != null ? volunteer.getSkill() : Volunteer.Skill.FIRST_AID);
        skillCombo.setMaxWidth(Double.MAX_VALUE);

        ComboBox<Volunteer.Availability> availCombo = new ComboBox<>();
        availCombo.getItems().addAll(Volunteer.Availability.values());
        availCombo.setValue(volunteer != null ? volunteer.getAvailability() : Volunteer.Availability.AVAILABLE);
        availCombo.setMaxWidth(Double.MAX_VALUE);

        TextField locField = new TextField(volunteer != null ? volunteer.getLocation() : "Central Sector");
        locField.setPromptText("Operating Sector / Location");

        Button saveBtn = new Button("Save Volunteer Profile");
        saveBtn.getStyleClass().addAll("button", "button-primary");
        saveBtn.setMaxWidth(Double.MAX_VALUE);
        saveBtn.setOnAction(e -> {
            Volunteer v = new Volunteer();
            v.setUserId(currentUser.getId());
            v.setPhone(phoneField.getText().trim());
            v.setEmail(emailField.getText().trim());
            v.setSkill(skillCombo.getValue());
            v.setAvailability(availCombo.getValue());
            v.setLocation(locField.getText().trim());

            boolean ok = volunteerDAO.createOrUpdateVolunteer(v);
            if (ok) {
                this.volunteer = volunteerDAO.findByUserId(currentUser.getId());
                UIUtils.showInformation("Profile Saved", "Volunteer skill profile updated successfully.");
                showRecommendedTasksView();
            }
        });

        formCard.getChildren().addAll(
                new Label("Contact Phone"), phoneField,
                new Label("Email Address"), emailField,
                new Label("Primary Skill Specialization"), skillCombo,
                new Label("Current Availability Status"), availCombo,
                new Label("Operating Location / Sector"), locField,
                saveBtn
        );

        contentArea.getChildren().addAll(title, formCard);
    }
}
