package com.disastermanagement.view;

import com.disastermanagement.model.User;
import com.disastermanagement.model.UserRole;
import com.disastermanagement.service.AuthService;
import com.disastermanagement.util.UIUtils;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

public class LoginView {
    private final Stage stage;
    private final AuthService authService = new AuthService();

    public LoginView(Stage stage) {
        this.stage = stage;
    }

    public void show() {
        VBox card = new VBox(14);
        card.getStyleClass().add("card");
        card.setMaxWidth(480);
        card.setAlignment(Pos.CENTER);
        card.setPadding(new Insets(30));

        Label brandLabel = new Label("DISASTER MANAGEMENT & EMERGENCY RESPONSE SYSTEM");
        brandLabel.setStyle("-fx-font-size: 11px; -fx-font-weight: 800; -fx-text-fill: #1E3A8A;");

        Label titleLabel = new Label("Portal Sign In");
        titleLabel.getStyleClass().add("h1");

        Label subLabel = new Label("Sign in with Google OAuth or your account credentials");
        subLabel.getStyleClass().add("subtitle");

        // Google OAuth Button
        Button googleBtn = new Button("🌐 Sign in with Google (Supabase Auth)");
        googleBtn.getStyleClass().add("button-google");
        googleBtn.setMaxWidth(Double.MAX_VALUE);
        googleBtn.setStyle("-fx-font-size: 14px; -fx-padding: 11px;");

        googleBtn.setOnAction(e -> {
            try {
                User gUser = authService.loginWithGoogleOAuth("citizen@demo.com", "Google Demo User");
                if (!gUser.isProfileComplete()) {
                    new ProfileSetupView(stage, gUser).show();
                } else {
                    navigateToDashboard(gUser.getRole());
                }
            } catch (Exception ex) {
                UIUtils.showError("Google Sign-In Error", ex.getMessage());
            }
        });

        Label orLabel = new Label("── OR EMAIL SIGN IN ──");
        orLabel.setStyle("-fx-font-size: 11px; -fx-text-fill: #94A3B8; -fx-font-weight: bold;");

        TextField usernameField = new TextField();
        usernameField.setPromptText("Username or Email (e.g. citizen@demo.com)");

        PasswordField passwordField = new PasswordField();
        passwordField.setPromptText("Password (e.g. citizen123)");

        Label errorLabel = new Label();
        errorLabel.setStyle("-fx-text-fill: #DC2626; -fx-font-size: 12px; -fx-font-weight: bold;");
        errorLabel.setVisible(false);

        Button loginBtn = new Button("Sign In");
        loginBtn.getStyleClass().addAll("button", "button-primary");
        loginBtn.setMaxWidth(Double.MAX_VALUE);
        loginBtn.setStyle("-fx-font-size: 14px; -fx-padding: 10px;");

        loginBtn.setOnAction(e -> {
            errorLabel.setVisible(false);
            try {
                User user = authService.login(usernameField.getText(), passwordField.getText());
                if (!user.isProfileComplete()) {
                    new ProfileSetupView(stage, user).show();
                } else {
                    navigateToDashboard(user.getRole());
                }
            } catch (Exception ex) {
                errorLabel.setText(ex.getMessage());
                errorLabel.setVisible(true);
            }
        });

        // Quick Demo Fill Buttons for Viva Demo
        Label demoLabel = new Label("Quick Demo Credentials:");
        demoLabel.setStyle("-fx-font-size: 12px; -fx-font-weight: bold; -fx-text-fill: #64748B;");

        HBox demoBox = new HBox(8);
        demoBox.setAlignment(Pos.CENTER);

        Button demoCitizen = new Button("Citizen");
        demoCitizen.getStyleClass().addAll("button", "button-secondary");
        demoCitizen.setOnAction(ev -> {
            usernameField.setText("citizen@demo.com");
            passwordField.setText("citizen123");
        });

        Button demoRescue = new Button("Rescue");
        demoRescue.getStyleClass().addAll("button", "button-secondary");
        demoRescue.setOnAction(ev -> {
            usernameField.setText("rescue@demo.com");
            passwordField.setText("rescue123");
        });

        Button demoVol = new Button("Volunteer");
        demoVol.getStyleClass().addAll("button", "button-secondary");
        demoVol.setOnAction(ev -> {
            usernameField.setText("volunteer@demo.com");
            passwordField.setText("volunteer123");
        });

        Button demoAdmin = new Button("Admin");
        demoAdmin.getStyleClass().addAll("button", "button-secondary");
        demoAdmin.setOnAction(ev -> {
            usernameField.setText("admin@demo.com");
            passwordField.setText("admin123");
        });

        demoBox.getChildren().addAll(demoCitizen, demoRescue, demoVol, demoAdmin);

        HBox footerBox = new HBox(10);
        footerBox.setAlignment(Pos.CENTER);

        Button registerBtn = new Button("Register New Account");
        registerBtn.getStyleClass().addAll("button", "button-secondary");
        registerBtn.setOnAction(e -> new RegisterView(stage).show());

        Button backLandingBtn = new Button("Home Screen");
        backLandingBtn.getStyleClass().addAll("button", "button-secondary");
        backLandingBtn.setOnAction(e -> new LandingView(stage).show());

        footerBox.getChildren().addAll(registerBtn, backLandingBtn);

        card.getChildren().addAll(
                brandLabel, titleLabel, subLabel,
                googleBtn, orLabel,
                usernameField, passwordField, errorLabel,
                loginBtn, demoLabel, demoBox, new Separator(), footerBox
        );

        VBox root = new VBox(card);
        root.setAlignment(Pos.CENTER);
        root.setPadding(new Insets(30));
        root.setStyle("-fx-background-color: #F8FAFC;");

        Scene scene = new Scene(root, 950, 750);
        scene.getStylesheets().add(getClass().getResource("/css/styles.css").toExternalForm());
        stage.setScene(scene);
        stage.setTitle("D-MERS - Sign In");
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
