package com.example.demo.service;

import com.example.demo.model.Reminder;
import com.example.demo.repository.ReminderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReminderService {

    private final ReminderRepository reminderRepository;

    public ReminderService(ReminderRepository reminderRepository) {
        this.reminderRepository = reminderRepository;
    }

    // Get all reminders
    public List<Reminder> getAllReminders() {
        return reminderRepository.findAll();
    }

    // Get today's reminders for a user
    public List<Reminder> getTodayReminders(Long userId) {

        return reminderRepository.findTodayReminders(
                LocalDate.now(),
                userId
        );
    }

    // Get all reminders for a user
    // Used by history.html
    public List<Reminder> getRemindersByUser(Long userId) {

        return reminderRepository.findByUserId(userId);
    }

    // Get reminder by ID
    public Reminder getReminderById(Long id) {

        return reminderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Reminder not found"));
    }

    // Create reminder
    public Reminder createReminder(Reminder reminder) {

        return reminderRepository.save(reminder);
    }

    // Update reminder status
    public Reminder updateStatus(Long id, String status) {

        Reminder reminder = getReminderById(id);

        if (!status.equalsIgnoreCase("TAKEN")
                && !status.equalsIgnoreCase("MISSED")
                && !status.equalsIgnoreCase("PENDING")) {

            throw new IllegalArgumentException(
                    "Invalid status. Use TAKEN, MISSED or PENDING."
            );
        }

        reminder.setStatus(status.toUpperCase());

        return reminderRepository.save(reminder);
    }

    // Mark medicine as TAKEN
    public Reminder markAsTaken(Long id) {

        return updateStatus(id, "TAKEN");
    }

    // Mark medicine as MISSED
    public Reminder markAsMissed(Long id) {

        return updateStatus(id, "MISSED");
    }

    // Delete reminder
    public void deleteReminder(Long id) {

        if (!reminderRepository.existsById(id)) {

            throw new RuntimeException(
                    "Reminder not found"
            );
        }

        reminderRepository.deleteById(id);
    }
}