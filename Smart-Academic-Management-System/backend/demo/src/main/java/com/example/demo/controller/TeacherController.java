package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.entity.Subject;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.SubjectRepository;
import com.example.demo.repository.StudentSubjectRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teachers")
@CrossOrigin(origins = "*")
public class TeacherController {

    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final StudentSubjectRepository studentSubjectRepository;

    public TeacherController(
            UserRepository userRepository,
            SubjectRepository subjectRepository,
            StudentSubjectRepository studentSubjectRepository) {

        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
        this.studentSubjectRepository = studentSubjectRepository;
    }

    // =========================================
    // GET ALL TEACHERS
    // =========================================

    @GetMapping
    public List<User> getAllTeachers() {

        return userRepository.findAll()
                .stream()
                .filter(user ->
                        "TEACHER".equalsIgnoreCase(user.getRole()))
                .collect(Collectors.toList());
    }

    // =========================================
    // GET TEACHER BY ID
    // =========================================

    @GetMapping("/{id}")
    public User getTeacherById(@PathVariable Long id) {

        return userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Teacher not found with ID: " + id));
    }

    // =========================================
    // GET SUBJECTS OF TEACHER
    // =========================================

    @GetMapping("/{teacherId}/subjects")
    public List<Subject> getTeacherSubjects(
            @PathVariable Long teacherId) {

        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Teacher not found with ID: " + teacherId));

        return subjectRepository.findAll()
                .stream()
                .filter(subject ->
                        subject.getTeacher() != null
                        && subject.getTeacher().getId()
                        .equals(teacher.getId()))
                .collect(Collectors.toList());
    }

    // =========================================
    // GET STUDENTS OF TEACHER BY ID
    // =========================================

    @GetMapping("/{teacherId}/students")
    public ResponseEntity<?> getStudentsByTeacherId(
            @PathVariable Long teacherId) {

        try {

            // Check that teacher exists
            User teacher = userRepository.findById(teacherId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Teacher not found with ID: " + teacherId));

            // Find students enrolled in subjects taught by this teacher
            List<User> students =
                    studentSubjectRepository
                            .findBySubjectTeacherId(teacher.getId())
                            .stream()
                            .map(studentSubject ->
                                    studentSubject.getStudent())
                            .filter(student ->
                                    student != null
                                    && "STUDENT".equalsIgnoreCase(
                                            student.getRole()))
                            .collect(Collectors.collectingAndThen(
                                    Collectors.toMap(
                                            User::getId,
                                            student -> student,
                                            (existing, replacement) -> existing
                                    ),
                                    map -> map.values()
                                            .stream()
                                            .toList()
                            ));

            return ResponseEntity.ok(students);

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body(
                            java.util.Map.of(
                                    "error",
                                    "Unable to load students",
                                    "message",
                                    e.getMessage() == null
                                            ? "Unknown error"
                                            : e.getMessage()
                            )
                    );
        }
    }

    // =========================================
    // GET TEACHER BY EMAIL
    // =========================================

    @GetMapping("/by-email")
    public User getTeacherByEmail(
            @RequestParam String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Teacher not found with email: " + email));
    }

    // =========================================
    // GET SUBJECTS BY TEACHER EMAIL
    // =========================================

    @GetMapping("/by-email/subjects")
    public List<Subject> getSubjectsByTeacherEmail(
            @RequestParam String email) {

        User teacher = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Teacher not found with email: " + email));

        return subjectRepository.findAll()
                .stream()
                .filter(subject ->
                        subject.getTeacher() != null
                        && subject.getTeacher().getId()
                        .equals(teacher.getId()))
                .collect(Collectors.toList());
    }

    // =========================================
    // GET STUDENTS OF TEACHER BY EMAIL
    // =========================================

    @GetMapping("/by-email/students")
    public List<User> getStudentsByTeacherEmail(
            @RequestParam String email) {

        User teacher = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Teacher not found with email: " + email));

        return studentSubjectRepository
                .findBySubjectTeacherId(teacher.getId())
                .stream()
                .map(studentSubject ->
                        studentSubject.getStudent())
                .filter(student ->
                        student != null
                        && "STUDENT".equalsIgnoreCase(
                                student.getRole()))
                .collect(Collectors.collectingAndThen(
                        Collectors.toMap(
                                User::getId,
                                student -> student,
                                (existing, replacement) -> existing
                        ),
                        map -> map.values()
                                .stream()
                                .toList()
                ));
    }
}

