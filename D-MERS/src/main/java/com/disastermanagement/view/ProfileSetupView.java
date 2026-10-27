package com.disastermanagement.view;

import com.disastermanagement.model.User;
import com.disastermanagement.model.UserRole;
import com.disastermanagement.service.AuthService;
import com.disastermanagement.util.UIUtils;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.stage.Stage;

public class ProfileSetupView {

    private final Stage stage;
    private final User currentUser;
    private final AuthService authService = new AuthService();

    public ProfileSetupView(Stage stage, User currentUser) {
        this.stage = stage;
        this.currentUser = currentUser;
    }

    public void show() {
        BorderPane root = new BorderPane();
        root.setStyle("-fx-background-color: #F8FAFC;");

        VBox card = new VBox(20);
        card.getStyleClass().add("card");
        card.setMaxWidth(500);
        card.setPadding(new Insets(30));

        Label title = new Label("Complete Your Profile");
        title.getStyleClass().add("h1");

        Label subtitle = new Label("Welcome to D-MERS! Please configure your account role and contact details to get started.");
        subtitle.getStyleClass().add("subtitle");
        subtitle.setWrapText(true);

        Label emailLabel = new Label("Account Email: " + (currentUser != null ? currentUser.getEmail() : ""));
        emailLabel.setStyle("-fx-font-weight: bold; -fx-text-fill: #1E3A8A;");

        Label roleLabel = new Label("Select Your Primary Role:");
        roleLabel.getStyleClass().add("h3");

        ToggleGroup roleGroup = new ToggleGroup();

        RadioButton citizenRadio = new RadioButton("Citizen (Report disasters & request rescue)");
        citizenRadio.setToggleGroup(roleGroup);
        citizenRadio.setSelected(true);
        citizenRadio.setUserData(UserRole.CITIZEN);

        RadioButton volunteerRadio = new RadioButton("Volunteer (Provide field assistance & relief support)");
        volunteerRadio.setToggleGroup(roleGroup);
        volunteerRadio.setUserData(UserRole.VOLUNTEER);

        RadioButton rescueRadio = new RadioButton("Rescue Team (Deploy emergency response operations)");
        rescueRadio.setToggleGroup(roleGroup);
        rescueRadio.setUserData(UserRole.RESCUE_TEAM);

        VBox roleBox = new VBox(10, citizenRadio, volunteerRadio, rescueRadio);
        roleBox.setPadding(new Insets(5, 0, 10, 0));

        TextField phoneField = new TextField();
        phoneField.setPromptText("Mobile Phone Number (Required)");

        TextField locationField = new TextField();
        locationField.setPromptText("Current City / District Location");

        TextField skillOrTeamField = new TextField();
        skillOrTeamField.setPromptText("Primary Skill (e.g. FIRST_AID) or Team Name");

        Button submitBtn = new Button("Complete Profile & Continue");
        submitBtn.getStyleClass().addAll("button", "button-primary");
        submitBtn.setMaxWidth(Double.MAX_VALUE);
        submitBtn.setStyle("-fx-font-size: 15px; -fx-padding: 12px;");

        submitBtn.setOnAction(e -> {
            try {
                UserRole selectedRole = (UserRole) roleGroup.getSelectedToggle().getUserData();
                String phone = phoneField.getText();
                String loc = locationField.getText();
                String skillOrTeam = skillOrTeamField.getText();

                boolean success = authService.completeProfile(currentUser, selectedRole, phone, loc, skillOrTeam);
                if (success) {
                    UIUtils.showInformation("Profile Configured", "Your profile has been set up successfully as " + selectedRole.getDisplayName() + "!");
                    navigateToDashboard(selectedRole);
                } else {
                    UIUtils.showError("Setup Error", "Failed to update user profile. Please try again.");
                }
            } catch (Exception ex) {
                UIUtils.showError("Validation Error", ex.getMessage());
            }
        });

        card.getChildren().addAll(title, subtitle, emailLabel, roleLabel, roleBox, phoneField, locationField, skillOrTeamField, submitBtn);

        StackPane centerContainer = new StackPane(card);
        centerContainer.setPadding(new Insets(40));
        root.setCenter(centerContainer);

        Scene scene = new Scene(root, 900, 700);
        scene.getStylesheets().add(getClass().getResource("/css/styles.css").toExternalForm());
        stage.setTitle("Complete Your Profile - D-MERS");
        stage.setScene(scene);
        stage.show();
    }

    private void navigateToDashboard(UserRole role) {
        switch (role) {
            case ADMIN:
                new AdminDashboard(stage).show();
                break;
            case RESCUE_TEAM:
                new RescueTeamDashboard(stage).show();
                break;
            case VOLUNTEER:
                new VolunteerDashboard(stage).show();
                break;
            case CITIZEN:
            default:
                new CitizenDashboard(stage).show();
                break;
        }
    }
}
