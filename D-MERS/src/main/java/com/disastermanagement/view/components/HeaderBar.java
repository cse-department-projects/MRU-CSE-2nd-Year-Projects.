package com.disastermanagement.view.components;

import com.disastermanagement.dao.NotificationDAO;
import com.disastermanagement.model.Notification;
import com.disastermanagement.model.User;
import com.disastermanagement.util.UIUtils;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ListView;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.layout.VBox;
import javafx.stage.Modality;
import javafx.stage.Stage;

import java.util.List;

public class HeaderBar extends HBox {

    private final NotificationDAO notificationDAO = new NotificationDAO();
    private Button notifyBtn;
    private final User currentUser;

    public HeaderBar(User currentUser, Runnable onLogout) {
        this.currentUser = currentUser;
        getStyleClass().add("header-bar");
        setAlignment(Pos.CENTER_LEFT);
        setSpacing(15);

        Label welcomeLabel = new Label("Welcome, " + (currentUser != null ? currentUser.getFullName() : "User"));
        welcomeLabel.getStyleClass().add("h2");

        Label roleBadge = new Label(currentUser != null ? currentUser.getRole().getDisplayName() : "");
        roleBadge.getStyleClass().addAll("badge", "badge-info");

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        // Notification Button
        notifyBtn = new Button("🔔 Notifications");
        notifyBtn.getStyleClass().addAll("button", "button-secondary");
        updateNotificationCount();
        notifyBtn.setOnAction(e -> showNotificationsModal());

        Button logoutBtn = new Button("🚪 Logout");
        logoutBtn.getStyleClass().addAll("button", "button-danger");
        logoutBtn.setOnAction(e -> onLogout.run());

        getChildren().addAll(welcomeLabel, roleBadge, spacer, notifyBtn, logoutBtn);
    }

    public void updateNotificationCount() {
        if (currentUser != null) {
            int unread = notificationDAO.getUnreadCount(currentUser.getId());
            if (unread > 0) {
                notifyBtn.setText("🔔 Notifications (" + unread + ")");
                notifyBtn.setStyle("-fx-border-color: #DC2626; -fx-text-fill: #DC2626; -fx-font-weight: bold;");
            } else {
                notifyBtn.setText("🔔 Notifications");
                notifyBtn.setStyle("");
            }
        }
    }

    private void showNotificationsModal() {
        if (currentUser == null) return;
        Stage stage = new Stage();
        stage.initModality(Modality.APPLICATION_MODAL);
        stage.setTitle("Notification Center - D-MERS");

        VBox layout = new VBox(15);
        layout.setPadding(new Insets(20));
        layout.setStyle("-fx-background-color: #FFFFFF;");

        Label title = new Label("In-App Notifications");
        title.getStyleClass().add("h2");

        ListView<String> listView = new ListView<>();
        List<Notification> list = notificationDAO.getNotificationsForUser(currentUser.getId());

        if (list.isEmpty()) {
            listView.getItems().add("No recent notifications.");
        } else {
            for (Notification n : list) {
                String prefix = n.isReadStatus() ? "✓ " : "🔴 [NEW] ";
                listView.getItems().add(prefix + n.getTitle() + "\n" + n.getMessage() + "\n(" + n.getCreatedAt().toString().replace("T", " ") + ")");
            }
        }

        Button markReadBtn = new Button("Mark All as Read");
        markReadBtn.getStyleClass().addAll("button", "button-primary");
        markReadBtn.setOnAction(e -> {
            notificationDAO.markAllAsRead(currentUser.getId());
            updateNotificationCount();
            stage.close();
            UIUtils.showInformation("Notifications", "All notifications marked as read.");
        });

        Button closeBtn = new Button("Close");
        closeBtn.getStyleClass().addAll("button", "button-secondary");
        closeBtn.setOnAction(e -> stage.close());

        HBox actions = new HBox(10, markReadBtn, closeBtn);
        actions.setAlignment(Pos.CENTER_RIGHT);

        layout.getChildren().addAll(title, listView, actions);
        stage.setScene(new Scene(layout, 500, 400));
        stage.show();
    }
}
