package com.disastermanagement.util;

import javafx.scene.control.Alert;
import javafx.scene.control.ButtonType;
import javafx.scene.control.DialogPane;
import javafx.scene.layout.Region;
import java.util.Optional;

public class UIUtils {

    public static void showInfo(String title, String content) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle(title);
        alert.setHeaderText(title);
        alert.setContentText(content);
        styleDialog(alert);
        alert.showAndWait();
    }

    public static void showInformation(String title, String content) {
        showInfo(title, content);
    }

    public static void showError(String title, String content) {
        Alert alert = new Alert(Alert.AlertType.ERROR);
        alert.setTitle(title);
        alert.setHeaderText(title);
        alert.setContentText(content);
        styleDialog(alert);
        alert.showAndWait();
    }

    public static void showWarning(String title, String content) {
        Alert alert = new Alert(Alert.AlertType.WARNING);
        alert.setTitle(title);
        alert.setHeaderText(title);
        alert.setContentText(content);
        styleDialog(alert);
        alert.showAndWait();
    }

    public static boolean showConfirm(String title, String content) {
        Alert alert = new Alert(Alert.AlertType.CONFIRMATION);
        alert.setTitle(title);
        alert.setHeaderText(title);
        alert.setContentText(content);
        styleDialog(alert);
        Optional<ButtonType> result = alert.showAndWait();
        return result.isPresent() && result.get() == ButtonType.OK;
    }

    private static void styleDialog(Alert alert) {
        DialogPane pane = alert.getDialogPane();
        pane.setMinHeight(Region.USE_PREF_SIZE);
        pane.getStyleClass().add("custom-dialog");
    }

    public static String getSeverityColor(String severity) {
        if (severity == null) return "#2563EB";
        switch (severity.toUpperCase()) {
            case "CRITICAL": return "#DC2626";
            case "HIGH": return "#EA580C";
            case "MEDIUM": return "#D97706";
            case "LOW": return "#059669";
            default: return "#2563EB";
        }
    }

    public static String getStatusColor(String status) {
        if (status == null) return "#64748B";
        switch (status.toUpperCase()) {
            case "COMPLETED":
            case "RESOLVED":
            case "FOUND":
                return "#059669";
            case "IN_PROGRESS":
            case "IN_ACTION":
            case "ASSIGNED":
            case "ACCEPTED":
                return "#2563EB";
            case "PENDING":
            case "REPORTED":
            case "OPEN":
            case "MISSING":
                return "#EA580C";
            case "CANCELLED":
            case "REJECTED":
                return "#DC2626";
            default:
                return "#64748B";
        }
    }
}
