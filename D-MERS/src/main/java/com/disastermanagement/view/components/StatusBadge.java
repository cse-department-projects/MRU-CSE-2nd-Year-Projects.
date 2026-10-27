package com.disastermanagement.view.components;

import com.disastermanagement.util.UIUtils;
import javafx.scene.control.Label;

public class StatusBadge extends Label {

    public StatusBadge(String text, String category) {
        super(text != null ? text.toUpperCase() : "");
        getStyleClass().add("badge");
        
        String color = "severity".equalsIgnoreCase(category) 
                ? UIUtils.getSeverityColor(text) 
                : UIUtils.getStatusColor(text);
                
        setStyle("-fx-background-color: " + color + ";");
    }
}
