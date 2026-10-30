package com.example.demo.repository;

import com.example.demo.entity.StudentNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentNoteRepository
        extends JpaRepository<StudentNote, Long> {

    List<StudentNote> findByStudentId(Long studentId);
}