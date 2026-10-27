package com.disastermanagement.view.components;

import javafx.scene.control.Label;
import javafx.scene.layout.VBox;

public class StatCard extends VBox {
    private final Label valueLabel;

    public StatCard(String title, String value, String accentColor) {
        getStyleClass().add("card");
        setSpacing(6);
        setPrefWidth(200);

        Label titleLabel = new Label(title.toUpperCase());
        titleLabel.getStyleClass().add("stat-card-title");

        valueLabel = new Label(value);
        valueLabel.getStyleClass().add("stat-card-value");
        if (accentColor != null) {
            valueLabel.setStyle("-fx-text-fill: " + accentColor + ";");
        }

        getChildren().addAll(titleLabel, valueLabel);
    }

    public void setValue(String value) {
        valueLabel.setText(value);
    }
}
