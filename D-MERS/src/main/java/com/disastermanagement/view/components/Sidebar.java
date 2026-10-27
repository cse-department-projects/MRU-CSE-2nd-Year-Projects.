package com.disastermanagement.view.components;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.VBox;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Consumer;

public class Sidebar extends VBox {
    private final Map<String, Button> navButtons = new HashMap<>();
    private Button activeBtn;

    public Sidebar(String roleName) {
        getStyleClass().add("sidebar");
        setPrefWidth(220);
        setSpacing(8);

        // App Brand Title
        Label brandLabel = new Label("DISASTER MANAGEMENT");
        brandLabel.getStyleClass().add("sidebar-title");
        
        Label roleLabel = new Label(roleName.toUpperCase() + " PORTAL");
        roleLabel.getStyleClass().add("subtitle");
        
        VBox headerBox = new VBox(4, brandLabel, roleLabel);
        headerBox.setPadding(new Insets(0, 0, 20, 0));
        headerBox.setAlignment(Pos.CENTER_LEFT);

        getChildren().add(headerBox);
    }

    public void addNavItem(String key, String title, Consumer<String> onSelect) {
        Button btn = new Button(title);
        btn.setMaxWidth(Double.MAX_VALUE);
        btn.getStyleClass().add("sidebar-btn");

        btn.setOnAction(e -> {
            setActive(key);
            onSelect.accept(key);
        });

        navButtons.put(key, btn);
        getChildren().add(btn);
    }

    public void setActive(String key) {
        if (activeBtn != null) {
            activeBtn.getStyleClass().remove("sidebar-btn-active");
        }
        Button target = navButtons.get(key);
        if (target != null) {
            target.getStyleClass().add("sidebar-btn-active");
            activeBtn = target;
        }
    }
}
