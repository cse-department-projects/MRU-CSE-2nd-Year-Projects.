package com.disastermanagement.view;

import com.disastermanagement.model.UserRole;
import com.disastermanagement.service.AuthService;
import com.disastermanagement.util.UIUtils;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

public class RegisterView {
    private final Stage stage;
    private final AuthService authService = new AuthService();

    public RegisterView(Stage stage) {
        this.stage = stage;
    }

    public void show() {
        VBox card = new VBox(12);
        card.getStyleClass().add("card");
        card.setMaxWidth(480);
        card.setAlignment(Pos.CENTER);
        card.setPadding(new Insets(30));

        Label titleLabel = new Label("Register Account");
        titleLabel.getStyleClass().add("h1");

        Label subLabel = new Label("Join D-MERS for emergency response, alerts, and community support");
        subLabel.getStyleClass().add("subtitle");

        TextField nameField = new TextField();
        nameField.setPromptText("Full Name");

        TextField usernameField = new TextField();
        usernameField.setPromptText("Username");

        TextField emailField = new TextField();
        emailField.setPromptText("Email Address");

        TextField phoneField = new TextField();
        phoneField.setPromptText("Phone Number");

        PasswordField passwordField = new PasswordField();
        passwordField.setPromptText("Password");

        ComboBox<UserRole> roleCombo = new ComboBox<>();
        // Admin accounts must be controlled securely and NOT freely selectable by anyone
        roleCombo.getItems().addAll(UserRole.CITIZEN, UserRole.VOLUNTEER, UserRole.RESCUE_TEAM);
        roleCombo.setValue(UserRole.CITIZEN);
        roleCombo.setMaxWidth(Double.MAX_VALUE);

        Label errorLabel = new Label();
        errorLabel.setStyle("-fx-text-fill: #DC2626; -fx-font-size: 12px; -fx-font-weight: bold;");
        errorLabel.setVisible(false);

        Button registerBtn = new Button("Complete Registration");
        registerBtn.getStyleClass().addAll("button", "button-primary");
        registerBtn.setMaxWidth(Double.MAX_VALUE);
        registerBtn.setOnAction(e -> {
            errorLabel.setVisible(false);
            try {
                boolean ok = authService.register(
                        usernameField.getText(),
                        passwordField.getText(),
                        nameField.getText(),
                        emailField.getText(),
                        phoneField.getText(),
                        roleCombo.getValue()
                );
                if (ok) {
                    UIUtils.showInformation("Registration Successful", "Your D-MERS account has been created. Please log in.");
                    new LoginView(stage).show();
                }
            } catch (Exception ex) {
                errorLabel.setText(ex.getMessage());
                errorLabel.setVisible(true);
            }
        });

        Button backBtn = new Button("Back to Login");
        backBtn.getStyleClass().addAll("button", "button-secondary");
        backBtn.setMaxWidth(Double.MAX_VALUE);
        backBtn.setOnAction(e -> new LoginView(stage).show());

        card.getChildren().addAll(
                titleLabel, subLabel,
                nameField, usernameField, emailField, phoneField, passwordField, roleCombo,
                errorLabel, registerBtn, backBtn
        );

        VBox root = new VBox(card);
        root.setAlignment(Pos.CENTER);
        root.setPadding(new Insets(40));
        root.setStyle("-fx-background-color: #F8FAFC;");

        Scene scene = new Scene(root, 950, 750);
        scene.getStylesheets().add(getClass().getResource("/css/styles.css").toExternalForm());
        stage.setScene(scene);
        stage.setTitle("D-MERS - Account Registration");
        stage.show();
    }
}
