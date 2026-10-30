package com.example.demo.controller;

import com.example.demo.model.Reminder;
import com.example.demo.service.ReminderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reminders")
@CrossOrigin(origins = "*")
public class ReminderController {

    private final ReminderService reminderService;

    public ReminderController(ReminderService reminderService) {
        this.reminderService = reminderService;
    }

    // Get all reminders
    @GetMapping
    public ResponseEntity<List<Reminder>> getAllReminders() {

        return ResponseEntity.ok(
                reminderService.getAllReminders()
        );
    }

    // Get today's reminders for a user
    // Example:
    // http://localhost:8080/api/reminders/today/1
    @GetMapping("/today/{userId}")
    public ResponseEntity<List<Reminder>> getTodayReminders(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                reminderService.getTodayReminders(userId)
        );
    }

    // Get all reminders for a user
    // Used by history.html
    // Example:
    // http://localhost:8080/api/reminders/user/1
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Reminder>> getUserReminders(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                reminderService.getRemindersByUser(userId)
        );
    }

    // Get reminder by ID
    @GetMapping("/{id}")
    public ResponseEntity<Reminder> getReminderById(
            @PathVariable Long id) {

        try {

            return ResponseEntity.ok(
                    reminderService.getReminderById(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // Create reminder
    @PostMapping
    public ResponseEntity<Reminder> createReminder(
            @RequestBody Reminder reminder) {

        return ResponseEntity.ok(
                reminderService.createReminder(reminder)
        );
    }

    // Mark reminder as TAKEN
    @PutMapping("/{id}/taken")
    public ResponseEntity<Reminder> markTaken(
            @PathVariable Long id) {

        try {

            return ResponseEntity.ok(
                    reminderService.markAsTaken(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // Mark reminder as MISSED
    @PutMapping("/{id}/missed")
    public ResponseEntity<Reminder> markMissed(
            @PathVariable Long id) {

        try {

            return ResponseEntity.ok(
                    reminderService.markAsMissed(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // Delete reminder
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteReminder(
            @PathVariable Long id) {

        try {

            reminderService.deleteReminder(id);

            return ResponseEntity.ok(
                    "Reminder deleted successfully"
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }
}