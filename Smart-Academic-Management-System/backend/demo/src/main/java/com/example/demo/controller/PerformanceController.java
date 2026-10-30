package com.example.demo.controller;

import com.example.demo.entity.StudentPerformance;
import com.example.demo.entity.StudentSubject;
import com.example.demo.entity.Subject;
import com.example.demo.entity.User;
import com.example.demo.repository.StudentPerformanceRepository;
import com.example.demo.repository.StudentSubjectRepository;
import com.example.demo.repository.SubjectRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.LinkedHashMap;

@RestController
@RequestMapping("/api/performance")
@CrossOrigin(origins = "*")
public class PerformanceController {

    private final StudentPerformanceRepository performanceRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final StudentSubjectRepository studentSubjectRepository;

    public PerformanceController(
            StudentPerformanceRepository performanceRepository,
            UserRepository userRepository,
            SubjectRepository subjectRepository,
            StudentSubjectRepository studentSubjectRepository) {

        this.performanceRepository = performanceRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
        this.studentSubjectRepository = studentSubjectRepository;
    }

    // ============================================================
    // GET PERFORMANCE RECORDS FOR A TEACHER
    // ============================================================

    @GetMapping("/teacher/{teacherId}/students")
    public ResponseEntity<?> getTeacherPerformance(
            @PathVariable Long teacherId) {

        try {

            userRepository.findById(teacherId)
                    .orElseThrow(() ->
                            new RuntimeException("Teacher not found."));

            return ResponseEntity.ok(
                    performanceRepository.findByTeacherId(teacherId)
                            .stream()
                            .map(this::toResponse)
                            .toList()
            );

        } catch (Exception e) {

            return ResponseEntity.status(
                    HttpStatus.INTERNAL_SERVER_ERROR
            ).body(
                    "Unable to load teacher performance: "
                            + e.getMessage()
            );
        }
    }

    // ============================================================
    // GET ALL PERFORMANCE RECORDS FOR ONE STUDENT
    // ============================================================

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getStudentPerformance(
            @PathVariable Long studentId) {

        try {

            User student = userRepository.findById(studentId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Student not found with ID: "
                                            + studentId
                            ));

            if (!"STUDENT".equalsIgnoreCase(student.getRole())) {

                return ResponseEntity.badRequest()
                        .body(
                                "The selected user is not a student."
                        );
            }

            return ResponseEntity.ok(
                    performanceRepository.findByStudentId(studentId)
                            .stream()
                            .map(this::toResponse)
                            .toList()
            );

        } catch (Exception e) {

            return ResponseEntity.status(
                    HttpStatus.INTERNAL_SERVER_ERROR
            ).body(
                    "Unable to load student performance: "
                            + e.getMessage()
            );
        }
    }

    // ============================================================
    // SAVE / UPDATE PERFORMANCE
    // ============================================================

    @PostMapping("/save")
    public ResponseEntity<?> savePerformance(
            @RequestBody Map<String, Object> request) {

        try {

            Long teacherId =
                    getLong(request, "teacherId");

            Long studentId =
                    getLong(request, "studentId");

            Long subjectId =
                    getLong(request, "subjectId");

            String performanceLevel =
                    getString(request, "performanceLevel");

            String remarks =
                    getString(request, "remarks");

            if (teacherId == null
                    || studentId == null
                    || subjectId == null) {

                return ResponseEntity.badRequest()
                        .body(
                                "teacherId, studentId and subjectId are required."
                        );
            }

            if (performanceLevel == null
                    || performanceLevel.isBlank()) {

                return ResponseEntity.badRequest()
                        .body(
                                "Performance is required."
                        );
            }

            performanceLevel =
                    performanceLevel
                            .trim()
                            .toUpperCase();

            Set<String> allowedLevels = Set.of(
                    "EXCELLENT",
                    "GOOD",
                    "AVERAGE",
                    "NEEDS IMPROVEMENT"
            );

            if (!allowedLevels.contains(
                    performanceLevel)) {

                return ResponseEntity.badRequest()
                        .body(
                                "Performance must be Excellent, Good, Average, or Needs Improvement."
                        );
            }

            User teacher =
                    userRepository.findById(teacherId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Teacher not found."
                                    ));

            User student =
                    userRepository.findById(studentId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Student not found."
                                    ));

            Subject subject =
                    subjectRepository.findById(subjectId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Subject not found."
                                    ));

            // ----------------------------------------------------
            // Validate teacher
            // ----------------------------------------------------

            if (!"TEACHER".equalsIgnoreCase(
                    teacher.getRole())) {

                return ResponseEntity.badRequest()
                        .body(
                                "The selected teacher account is invalid."
                        );
            }

            // ----------------------------------------------------
            // Validate student
            // ----------------------------------------------------

            if (!"STUDENT".equalsIgnoreCase(
                    student.getRole())) {

                return ResponseEntity.badRequest()
                        .body(
                                "The selected user is not a student."
                        );
            }

            // ----------------------------------------------------
            // Validate subject belongs to teacher
            // ----------------------------------------------------

            if (subject.getTeacher() == null
                    || subject.getTeacher().getId() == null
                    || !teacherId.equals(
                            subject.getTeacher().getId())) {

                return ResponseEntity.status(
                        HttpStatus.FORBIDDEN
                ).body(
                        "This subject is not assigned to this teacher."
                );
            }

            // ----------------------------------------------------
            // Validate student is assigned to subject
            // ----------------------------------------------------

            boolean enrolled =
                    studentSubjectRepository
                            .findByStudentId(studentId)
                            .stream()
                            .map(StudentSubject::getSubject)
                            .filter(s ->
                                    s != null
                                            && s.getId() != null)
                            .anyMatch(s ->
                                    subjectId.equals(
                                            s.getId()
                                    ));

            if (!enrolled) {

                return ResponseEntity.badRequest()
                        .body(
                                "This student is not assigned to the selected subject."
                        );
            }

            // ----------------------------------------------------
            // Find existing performance
            // or create new one
            // ----------------------------------------------------

            StudentPerformance performance =
                    performanceRepository
                            .findByStudentIdAndSubjectId(
                                    studentId,
                                    subjectId
                            )
                            .orElseGet(
                                    StudentPerformance::new
                            );

            performance.setStudent(student);
            performance.setSubject(subject);
            performance.setTeacher(teacher);

            performance.setPerformanceLevel(
                    performanceLevel
            );

            performance.setRemarks(
                    remarks == null
                            ? ""
                            : remarks.trim()
            );

            performance.setUpdatedAt(
                    LocalDateTime.now()
            );

            StudentPerformance saved =
                    performanceRepository.save(
                            performance
                    );

            return ResponseEntity.ok(
                    toResponse(saved)
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(
                    HttpStatus.INTERNAL_SERVER_ERROR
            ).body(
                    "Error saving student performance: "
                            + e.getMessage()
            );
        }
    }

    // ============================================================
    // RESPONSE JSON
    // ============================================================

    private Map<String, Object> toResponse(
            StudentPerformance performance) {

        Map<String, Object> row =
                new LinkedHashMap<>();

        User student =
                performance.getStudent();

        Subject subject =
                performance.getSubject();

        User teacher =
                performance.getTeacher();

        row.put(
                "id",
                performance.getId()
        );

        row.put(
                "studentId",
                student != null
                        ? student.getId()
                        : null
        );

        row.put(
                "studentName",
                student != null
                        ? student.getName()
                        : null
        );

        row.put(
                "studentEmail",
                student != null
                        ? student.getEmail()
                        : null
        );

        row.put(
                "subjectId",
                subject != null
                        ? subject.getId()
                        : null
        );

        row.put(
                "subjectName",
                subject != null
                        ? subject.getName()
                        : null
        );

        row.put(
                "teacherId",
                teacher != null
                        ? teacher.getId()
                        : null
        );

        row.put(
                "teacherName",
                teacher != null
                        ? teacher.getName()
                        : null
        );

        row.put(
                "teacherEmail",
                teacher != null
                        ? teacher.getEmail()
                        : null
        );

        row.put(
                "performanceLevel",
                performance.getPerformanceLevel()
        );

        row.put(
                "remarks",
                performance.getRemarks()
        );

        row.put(
                "updatedAt",
                performance.getUpdatedAt()
        );

        return row;
    }

    // ============================================================
    // HELPERS
    // ============================================================

    private Long getLong(
            Map<String, Object> request,
            String key) {

        Object value =
                request.get(key);

        if (value == null) {
            return null;
        }

        try {

            return Long.valueOf(
                    String.valueOf(value)
            );

        } catch (NumberFormatException e) {

            return null;
        }
    }

    private String getString(
            Map<String, Object> request,
            String key) {

        Object value =
                request.get(key);

        return value == null
                ? null
                : String.valueOf(value);
    }
}