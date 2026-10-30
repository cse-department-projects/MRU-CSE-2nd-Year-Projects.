package com.example.demo.controller;

import com.example.demo.entity.StudentNote;
import com.example.demo.entity.StudentSubject;
import com.example.demo.entity.StudyMaterial;
import com.example.demo.entity.Subject;
import com.example.demo.entity.User;

import com.example.demo.repository.StudentNoteRepository;
import com.example.demo.repository.StudentSubjectRepository;
import com.example.demo.repository.StudyMaterialRepository;
import com.example.demo.repository.UserRepository;

import jakarta.persistence.EntityManager;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    private final UserRepository userRepository;
    private final StudentSubjectRepository studentSubjectRepository;
    private final StudyMaterialRepository studyMaterialRepository;
    private final StudentNoteRepository studentNoteRepository;
    private final EntityManager entityManager;

    public StudentController(
            UserRepository userRepository,
            StudentSubjectRepository studentSubjectRepository,
            StudyMaterialRepository studyMaterialRepository,
            StudentNoteRepository studentNoteRepository,
            EntityManager entityManager) {

        this.userRepository = userRepository;
        this.studentSubjectRepository = studentSubjectRepository;
        this.studyMaterialRepository = studyMaterialRepository;
        this.studentNoteRepository = studentNoteRepository;
        this.entityManager = entityManager;
    }

    // =====================================================
    // STUDENT PROFILE
    // =====================================================

    @GetMapping("/profile")
    public ResponseEntity<?> getStudentProfile(
            @RequestParam String email) {

        Optional<User> studentOptional =
                userRepository.findByEmail(email);

        if (studentOptional.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Student not found");
        }

        User student = studentOptional.get();

        Map<String, Object> profile = new HashMap<>();

        profile.put("id", student.getId());
        profile.put("name", student.getName());
        profile.put("email", student.getEmail());
        profile.put("role", student.getRole());

        return ResponseEntity.ok(profile);
    }

    // =====================================================
    // STUDENT SUBJECTS
    // =====================================================

    @GetMapping("/subjects")
    public ResponseEntity<?> getStudentSubjects(
            @RequestParam String email) {

        Optional<User> studentOptional =
                userRepository.findByEmail(email);

        if (studentOptional.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Student not found");
        }

        User student = studentOptional.get();

        List<StudentSubject> studentSubjects =
                studentSubjectRepository
                        .findByStudentId(student.getId());

        List<Map<String, Object>> subjects =
                new ArrayList<>();

        for (StudentSubject studentSubject : studentSubjects) {

            Subject subject =
                    studentSubject.getSubject();

            if (subject == null) {
                continue;
            }

            Map<String, Object> subjectData =
                    new HashMap<>();

            subjectData.put(
                    "id",
                    subject.getId()
            );

            subjectData.put(
                    "name",
                    subject.getName()
            );

            subjectData.put(
                    "description",
                    subject.getDescription()
            );

            if (subject.getTeacher() != null) {

                subjectData.put(
                        "teacher",
                        subject.getTeacher().getName()
                );

            } else {

                subjectData.put(
                        "teacher",
                        "Not assigned"
                );
            }

            subjects.add(subjectData);
        }

        return ResponseEntity.ok(subjects);
    }

    // =====================================================
    // SAVE STUDY MATERIAL
    // =====================================================

    @PostMapping("/study-materials")
    public ResponseEntity<?> saveStudyMaterial(
            @RequestBody Map<String, Object> request) {

        String email =
                request.get("email") != null
                        ? request.get("email").toString()
                        : null;

        String subjectIdText =
                request.get("subjectId") != null
                        ? request.get("subjectId").toString()
                        : null;

        String content =
                request.get("content") != null
                        ? request.get("content").toString()
                        : null;

        if (email == null ||
                subjectIdText == null ||
                content == null ||
                content.trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Email, subject and content are required");
        }

        Optional<User> studentOptional =
                userRepository.findByEmail(email);

        if (studentOptional.isEmpty()) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Student not found");
        }

        Long subjectId;

        try {

            subjectId =
                    Long.parseLong(subjectIdText);

        } catch (NumberFormatException e) {

            return ResponseEntity
                    .badRequest()
                    .body("Invalid subject id");
        }

        // Check that subject exists
        Subject subject;

        try {

            subject =
                    entityManager.getReference(
                            Subject.class,
                            subjectId
                    );

            // Force Hibernate to verify that the subject exists
            subject.getId();

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Subject not found");
        }

        User student =
                studentOptional.get();

        StudyMaterial material =
                new StudyMaterial();

        material.setStudent(student);
        material.setSubject(subject);
        material.setContent(content.trim());

        StudyMaterial saved =
                studyMaterialRepository.save(material);

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "id",
                saved.getId()
        );

        response.put(
                "subjectId",
                subject.getId()
        );

        response.put(
                "subjectName",
                subject.getName()
        );

        response.put(
                "content",
                saved.getContent()
        );

        response.put(
                "message",
                "Study material saved successfully"
        );

        return ResponseEntity.ok(response);
    }

    // =====================================================
    // GET STUDY MATERIALS
    // =====================================================

    @GetMapping("/study-materials")
    public ResponseEntity<?> getStudyMaterials(
            @RequestParam String email) {

        Optional<User> studentOptional =
                userRepository.findByEmail(email);

        if (studentOptional.isEmpty()) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Student not found");
        }

        User student =
                studentOptional.get();

        List<StudyMaterial> materials =
                studyMaterialRepository
                        .findByStudentId(student.getId());

        List<Map<String, Object>> response =
                new ArrayList<>();

        for (StudyMaterial material : materials) {

            Map<String, Object> data =
                    new HashMap<>();

            data.put(
                    "id",
                    material.getId()
            );

            if (material.getSubject() != null) {

                data.put(
                        "subjectId",
                        material.getSubject().getId()
                );

                data.put(
                        "subjectName",
                        material.getSubject().getName()
                );

            } else {

                data.put(
                        "subjectId",
                        null
                );

                data.put(
                        "subjectName",
                        "Unknown Subject"
                );
            }

            data.put(
                    "content",
                    material.getContent()
            );

            response.add(data);
        }

        return ResponseEntity.ok(response);
    }

    // =====================================================
    // DELETE STUDY MATERIAL
    // =====================================================

    @DeleteMapping("/study-materials/{id}")
    public ResponseEntity<?> deleteStudyMaterial(
            @PathVariable Long id) {

        Optional<StudyMaterial> materialOptional =
                studyMaterialRepository.findById(id);

        if (materialOptional.isEmpty()) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Study material not found");
        }

        studyMaterialRepository.delete(
                materialOptional.get()
        );

        return ResponseEntity.ok(
                "Study material deleted successfully"
        );
    }

    // =====================================================
    // SAVE NOTE
    // =====================================================

    @PostMapping("/notes")
    public ResponseEntity<?> saveNote(
            @RequestBody Map<String, String> request) {

        String email =
                request.get("email");

        String title =
                request.get("title");

        String content =
                request.get("content");

        if (email == null ||
                title == null ||
                content == null ||
                title.trim().isEmpty() ||
                content.trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Email, title and content are required");
        }

        Optional<User> studentOptional =
                userRepository.findByEmail(email);

        if (studentOptional.isEmpty()) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Student not found");
        }

        StudentNote note =
                new StudentNote();

        note.setStudent(
                studentOptional.get()
        );

        note.setTitle(
                title.trim()
        );

        note.setContent(
                content.trim()
        );

        StudentNote saved =
                studentNoteRepository.save(note);

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "id",
                saved.getId()
        );

        response.put(
                "title",
                saved.getTitle()
        );

        response.put(
                "content",
                saved.getContent()
        );

        response.put(
                "message",
                "Note saved successfully"
        );

        return ResponseEntity.ok(response);
    }

    // =====================================================
    // GET NOTES
    // =====================================================

    @GetMapping("/notes")
    public ResponseEntity<?> getNotes(
            @RequestParam String email) {

        Optional<User> studentOptional =
                userRepository.findByEmail(email);

        if (studentOptional.isEmpty()) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Student not found");
        }

        User student =
                studentOptional.get();

        List<StudentNote> notes =
                studentNoteRepository
                        .findByStudentId(student.getId());

        List<Map<String, Object>> response =
                new ArrayList<>();

        for (StudentNote note : notes) {

            Map<String, Object> data =
                    new HashMap<>();

            data.put(
                    "id",
                    note.getId()
            );

            data.put(
                    "title",
                    note.getTitle()
            );

            data.put(
                    "content",
                    note.getContent()
            );

            response.add(data);
        }

        return ResponseEntity.ok(response);
    }

    // =====================================================
    // UPDATE NOTE
    // =====================================================

    @PutMapping("/notes/{id}")
    public ResponseEntity<?> updateNote(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        Optional<StudentNote> optionalNote =
                studentNoteRepository.findById(id);

        if (optionalNote.isEmpty()) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Note not found");
        }

        StudentNote note =
                optionalNote.get();

        String title =
                request.get("title");

        String content =
                request.get("content");

        if (title == null ||
                title.trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Title is required");
        }

        if (content == null ||
                content.trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Content is required");
        }

        note.setTitle(
                title.trim()
        );

        note.setContent(
                content.trim()
        );

        StudentNote updated =
                studentNoteRepository.save(note);

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "id",
                updated.getId()
        );

        response.put(
                "title",
                updated.getTitle()
        );

        response.put(
                "content",
                updated.getContent()
        );

        response.put(
                "message",
                "Note updated successfully"
        );

        return ResponseEntity.ok(response);
    }

    // =====================================================
    // DELETE NOTE
    // =====================================================

    @DeleteMapping("/notes/{id}")
    public ResponseEntity<?> deleteNote(
            @PathVariable Long id) {

        Optional<StudentNote> optionalNote =
                studentNoteRepository.findById(id);

        if (optionalNote.isEmpty()) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Note not found");
        }

        studentNoteRepository.delete(
                optionalNote.get()
        );

        return ResponseEntity.ok(
                "Note deleted successfully"
        );
    }
}

