package com.disastermanagement.view;

import javafx.animation.*;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.control.ProgressBar;
import javafx.scene.effect.DropShadow;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.paint.CycleMethod;
import javafx.scene.paint.LinearGradient;
import javafx.scene.paint.Stop;
import javafx.scene.shape.Circle;
import javafx.scene.shape.SVGPath;
import javafx.stage.Stage;
import javafx.util.Duration;

public class SplashView {
    private final Stage stage;
    private final Runnable onFinished;

    public SplashView(Stage stage, Runnable onFinished) {
        this.stage = stage;
        this.onFinished = onFinished;
    }

    public void show() {
        VBox root = new VBox(18);
        root.setAlignment(Pos.CENTER);
        root.setPadding(new Insets(40));

        // Dark gradient background
        LinearGradient bgGradient = new LinearGradient(
                0, 0, 1, 1, true, CycleMethod.NO_CYCLE,
                new Stop(0, Color.web("#0F172A")),
                new Stop(1, Color.web("#1E293B"))
        );
        root.setBackground(new Background(new BackgroundFill(bgGradient, CornerRadii.EMPTY, Insets.EMPTY)));

        // Animated Shield / Emergency Logo Emblem Component
        StackPane logoGroup = new StackPane();

        Circle glowCircle = new Circle(55);
        glowCircle.setFill(Color.web("#0284C7", 0.25));
        DropShadow shadow = new DropShadow(35, Color.web("#38BDF8"));
        glowCircle.setEffect(shadow);

        SVGPath shieldIcon = new SVGPath();
        shieldIcon.setContent("M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-5.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z");
        shieldIcon.setScaleX(2.4);
        shieldIcon.setScaleY(2.4);
        shieldIcon.setFill(Color.web("#38BDF8"));

        logoGroup.getChildren().addAll(glowCircle, shieldIcon);

        // App Title Labels
        Label brandLabel = new Label("DISASTER MANAGEMENT");
        brandLabel.setStyle("-fx-font-size: 26px; -fx-font-weight: bold; -fx-text-fill: #FFFFFF; -fx-letter-spacing: 2px;");

        Label subLabel = new Label("EMERGENCY RESPONSE SYSTEM");
        subLabel.setStyle("-fx-font-size: 15px; -fx-font-weight: bold; -fx-text-fill: #38BDF8; -fx-letter-spacing: 1px;");

        Label statusLabel = new Label("Initializing Security & Operations Modules...");
        statusLabel.setStyle("-fx-font-size: 13px; -fx-text-fill: #94A3B8;");

        ProgressBar progressBar = new ProgressBar(0);
        progressBar.setPrefWidth(320);
        progressBar.setStyle("-fx-accent: #0284C7; -fx-control-inner-background: #0F172A;");

        root.getChildren().addAll(logoGroup, brandLabel, subLabel, new Region(), progressBar, statusLabel);

        Scene scene = new Scene(root, 900, 650);
        stage.setScene(scene);
        stage.setTitle("Disaster Management & Emergency Response System");
        stage.show();

        // 1. Initial Scale & Fade In for Logo
        logoGroup.setScaleX(0.2);
        logoGroup.setScaleY(0.2);
        logoGroup.setOpacity(0);

        ScaleTransition scaleIn = new ScaleTransition(Duration.millis(800), logoGroup);
        scaleIn.setToX(1.0);
        scaleIn.setToY(1.0);

        FadeTransition fadeInLogo = new FadeTransition(Duration.millis(800), logoGroup);
        fadeInLogo.setToValue(1.0);

        ParallelTransition logoEntrance = new ParallelTransition(scaleIn, fadeInLogo);

        // 2. Pulse Animation for Shield Glow
        ScaleTransition pulse = new ScaleTransition(Duration.millis(1000), glowCircle);
        pulse.setFromX(1.0);
        pulse.setFromY(1.0);
        pulse.setToX(1.2);
        pulse.setToY(1.2);
        pulse.setAutoReverse(true);
        pulse.setCycleCount(Animation.INDEFINITE);

        // 3. Progress Bar Timeline
        Timeline progressTimeline = new Timeline(
                new KeyFrame(Duration.ZERO, new KeyValue(progressBar.progressProperty(), 0)),
                new KeyFrame(Duration.millis(1000), new KeyValue(statusLabel.textProperty(), "Loading Telemetry & Database Schema...")),
                new KeyFrame(Duration.millis(1800), new KeyValue(progressBar.progressProperty(), 0.7)),
                new KeyFrame(Duration.millis(2400), new KeyValue(statusLabel.textProperty(), "Ready")),
                new KeyFrame(Duration.millis(2600), new KeyValue(progressBar.progressProperty(), 1.0))
        );

        // 4. Final Fade Out to Login Transition
        FadeTransition fadeOutScreen = new FadeTransition(Duration.millis(600), root);
        fadeOutScreen.setFromValue(1.0);
        fadeOutScreen.setToValue(0.0);
        fadeOutScreen.setOnFinished(e -> {
            pulse.stop();
            onFinished.run();
        });

        // Chain animations
        logoEntrance.setOnFinished(e -> {
            pulse.play();
            progressTimeline.play();
        });

        progressTimeline.setOnFinished(e -> fadeOutScreen.play());

        logoEntrance.play();
    }
}
