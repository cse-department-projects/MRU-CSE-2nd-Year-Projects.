package com.example.demo.repository;

import com.example.demo.model.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {

    // Get all reminders for a particular date
    List<Reminder> findByReminderDate(LocalDate date);

    // Get today's reminders for a particular user
    @Query("""
        SELECT r
        FROM Reminder r
        WHERE r.reminderDate = :date
        AND r.medicine.user.id = :userId
        ORDER BY r.reminderTime ASC
    """)
    List<Reminder> findTodayReminders(
            LocalDate date,
            Long userId
    );

    // Get all reminders for a particular user
    // Used by history.html
    @Query("""
        SELECT r
        FROM Reminder r
        WHERE r.medicine.user.id = :userId
        ORDER BY r.reminderDate DESC, r.reminderTime DESC
    """)
    List<Reminder> findByUserId(Long userId);

    // Delete all reminders belonging to a medicine
    @Modifying
    @Transactional
    @Query("DELETE FROM Reminder r WHERE r.medicine.id = :medicineId")
    void deleteByMedicineId(Long medicineId);
}

