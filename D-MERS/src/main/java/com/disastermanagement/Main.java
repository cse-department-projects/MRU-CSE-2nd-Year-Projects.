package com.disastermanagement;

import com.disastermanagement.database.DatabaseInitializer;
import com.disastermanagement.model.User;
import com.disastermanagement.service.AuthService;
import com.disastermanagement.view.*;
import javafx.application.Application;
import javafx.stage.Stage;

public class Main extends Application {
    private Stage primaryStage;

    @Override
    public void start(Stage stage) {
        this.primaryStage = stage;

        // Auto-initialize Database tables & seed demo data if missing
        DatabaseInitializer.checkAndInitialize();

        // Show Animated Splash & Logo Reveal Screen, then transition to Landing Screen
        SplashView splashView = new SplashView(primaryStage, this::showLandingScreen);
        splashView.show();
    }

    private void showLandingScreen() {
        AuthService.logout();
        LandingView landingView = new LandingView(primaryStage);
        landingView.show();
    }

    private void showLoginScreen() {
        AuthService.logout();
        LoginView loginView = new LoginView(primaryStage);
        loginView.show();
    }

    private void showRegisterScreen() {
        RegisterView registerView = new RegisterView(primaryStage);
        registerView.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
