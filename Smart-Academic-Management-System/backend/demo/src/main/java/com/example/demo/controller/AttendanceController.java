package com.example.demo.controller;

import com.example.demo.entity.Attendance;
import com.example.demo.entity.Subject;
import com.example.demo.entity.User;
import com.example.demo.repository.AttendanceRepository;
import com.example.demo.repository.StudentSubjectRepository;
import com.example.demo.repository.SubjectRepository;
import com.example.demo.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final StudentSubjectRepository studentSubjectRepository;

    public AttendanceController(
            AttendanceRepository attendanceRepository,
            UserRepository userRepository,
            SubjectRepository subjectRepository,
            StudentSubjectRepository studentSubjectRepository) {

        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
        this.studentSubjectRepository = studentSubjectRepository;
    }

    /*
     * ============================================================
     * GET STUDENTS FOR A TEACHER'S SUBJECT
     * ============================================================
     *
     * Used by the teacher attendance section.
     *
     * Example:
     * GET /api/attendance/teacher/7/students?subjectId=1
     */
    @GetMapping("/teacher/{teacherId}/students")
    public ResponseEntity<?> getStudentsForSubject(
            @PathVariable Long teacherId,
            @RequestParam Long subjectId) {

        try {

            User teacher = userRepository.findById(teacherId)
                    .orElseThrow(() ->
                            new RuntimeException("Teacher not found.")
                    );

            Subject subject = subjectRepository.findById(subjectId)
                    .orElseThrow(() ->
                            new RuntimeException("Subject not found.")
                    );

            /*
             * Make sure this subject belongs to this teacher.
             */
            if (subject.getTeacher() == null
                    || !teacher.getId().equals(
                            subject.getTeacher().getId())) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                "This subject is not assigned to this teacher."
                        );
            }

            List<Map<String, Object>> students =
                    studentSubjectRepository
                            .findBySubjectTeacherId(teacherId)
                            .stream()

                            .filter(ss ->
                                    ss.getSubject() != null
                                            && subjectId.equals(
                                            ss.getSubject().getId()
                                    )
                            )

                            .map(ss -> ss.getStudent())

                            .filter(Objects::nonNull)

                            .filter(student ->
                                    "STUDENT".equalsIgnoreCase(
                                            student.getRole()
                                    )
                            )

                            .collect(Collectors.toMap(
                                    User::getId,

                                    student -> {

                                        Map<String, Object> row =
                                                new LinkedHashMap<>();

                                        row.put(
                                                "id",
                                                student.getId()
                                        );

                                        row.put(
                                                "name",
                                                student.getName()
                                        );

                                        row.put(
                                                "email",
                                                student.getEmail()
                                        );

                                        return row;
                                    },

                                    (first, second) -> first,

                                    LinkedHashMap::new
                            ))

                            .values()

                            .stream()

                            .toList();

            return ResponseEntity.ok(students);

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Unable to load attendance students: "
                                    + e.getMessage()
                    );
        }
    }


    /*
     * ============================================================
     * GET TEACHER ATTENDANCE FOR A DATE
     * ============================================================
     *
     * Example:
     *
     * GET /api/attendance/teacher/7?date=2026-09-19
     *
     * Or:
     *
     * GET /api/attendance/teacher/7?date=2026-09-19&subjectId=1
     */
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<?> getTeacherAttendance(
            @PathVariable Long teacherId,
            @RequestParam LocalDate date,
            @RequestParam(required = false) Long subjectId) {

        try {

            /*
             * Make sure teacher exists.
             */
            userRepository.findById(teacherId)
                    .orElseThrow(() ->
                            new RuntimeException("Teacher not found.")
                    );

            List<Attendance> records;

            if (subjectId != null) {

                records =
                        attendanceRepository
                                .findByTeacherIdAndSubjectIdAndAttendanceDate(
                                        teacherId,
                                        subjectId,
                                        date
                                );

            } else {

                records =
                        attendanceRepository
                                .findByTeacherIdAndAttendanceDate(
                                        teacherId,
                                        date
                                );
            }

            return ResponseEntity.ok(
                    records.stream()
                            .map(this::toResponse)
                            .toList()
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Unable to load attendance: "
                                    + e.getMessage()
                    );
        }
    }


    /*
     * ============================================================
     * GET STUDENT ATTENDANCE
     * ============================================================
     *
     * Example:
     *
     * GET /api/attendance/student/2
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getStudentAttendance(
            @PathVariable Long studentId) {

        try {

            userRepository.findById(studentId)
                    .orElseThrow(() ->
                            new RuntimeException("Student not found.")
                    );

            List<Attendance> records =
                    attendanceRepository
                            .findByStudentIdOrderByAttendanceDateDesc(
                                    studentId
                            );

            return ResponseEntity.ok(
                    records.stream()
                            .map(this::toResponse)
                            .toList()
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Unable to load student attendance: "
                                    + e.getMessage()
                    );
        }
    }


    /*
     * ============================================================
     * SAVE ATTENDANCE
     * ============================================================
     *
     * Used by the teacher attendance page.
     *
     * Existing attendance for the same:
     *
     * student + subject + date
     *
     * is updated instead of creating a duplicate.
     */
    @PostMapping("/save")
    public ResponseEntity<?> saveAttendance(
            @RequestBody Map<String, Object> request) {

        try {

            Long teacherId =
                    Long.valueOf(
                            String.valueOf(
                                    request.get("teacherId")
                            )
                    );

            Long subjectId =
                    Long.valueOf(
                            String.valueOf(
                                    request.get("subjectId")
                            )
                    );

            LocalDate date =
                    LocalDate.parse(
                            String.valueOf(
                                    request.get("date")
                            )
                    );


            /*
             * Find teacher.
             */
            User teacher =
                    userRepository.findById(teacherId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Teacher not found."
                                    )
                            );


            /*
             * Find subject.
             */
            Subject subject =
                    subjectRepository.findById(subjectId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Subject not found."
                                    )
                            );


            /*
             * Make sure subject belongs to teacher.
             */
            if (subject.getTeacher() == null
                    || !teacher.getId().equals(
                            subject.getTeacher().getId())) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                "This subject is not assigned to this teacher."
                        );
            }


            /*
             * Get attendance records from request.
             */
            Object recordsObject =
                    request.get("records");

            if (!(recordsObject instanceof List<?> records)) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Attendance records are required."
                        );
            }


            List<Attendance> savedRecords =
                    new ArrayList<>();


            for (Object recordObject : records) {

                if (!(recordObject instanceof Map<?, ?> record)) {
                    continue;
                }


                /*
                 * Student ID.
                 */
                Object studentIdObject =
                        record.get("studentId");

                if (studentIdObject == null) {
                    continue;
                }

                Long studentId =
                        Long.valueOf(
                                String.valueOf(
                                        studentIdObject
                                )
                        );


                /*
                 * Attendance status.
                 */
                Object statusObject =
                        record.get("status");

                if (statusObject == null) {

                    return ResponseEntity
                            .badRequest()
                            .body(
                                    "Attendance status is required."
                            );
                }

                String status =
                        String.valueOf(statusObject)
                                .trim()
                                .toUpperCase();


                /*
                 * Only PRESENT or ABSENT is allowed.
                 */
                if (!status.equals("PRESENT")
                        && !status.equals("ABSENT")) {

                    return ResponseEntity
                            .badRequest()
                            .body(
                                    "Attendance status must be PRESENT or ABSENT."
                            );
                }


                /*
                 * Find student.
                 */
                User student =
                        userRepository.findById(studentId)
                                .orElseThrow(() ->
                                        new RuntimeException(
                                                "Student not found with ID: "
                                                        + studentId
                                        )
                                );


                /*
                 * Make sure the selected student
                 * is actually enrolled in this subject.
                 */
                boolean enrolled =
                        studentSubjectRepository
                                .findByStudentId(studentId)
                                .stream()
                                .anyMatch(
                                        ss ->
                                                ss.getSubject() != null
                                                        && subjectId.equals(
                                                        ss.getSubject().getId()
                                                )
                                );

                if (!enrolled) {

                    return ResponseEntity
                            .badRequest()
                            .body(
                                    "Student "
                                            + student.getName()
                                            + " is not enrolled in this subject."
                            );
                }


                /*
                 * Find existing attendance.
                 *
                 * Because Attendance has a unique constraint on:
                 *
                 * student_id + subject_id + attendance_date
                 *
                 * we update the existing record if found.
                 */
                Optional<Attendance> existing =
                        attendanceRepository
                                .findByStudentIdAndSubjectIdAndAttendanceDate(
                                        studentId,
                                        subjectId,
                                        date
                                );


                Attendance attendance =
                        existing.orElseGet(
                                Attendance::new
                        );


                attendance.setStudent(student);
                attendance.setSubject(subject);
                attendance.setTeacher(teacher);
                attendance.setAttendanceDate(date);
                attendance.setStatus(status);


                savedRecords.add(
                        attendanceRepository.save(
                                attendance
                        )
                );
            }


            return ResponseEntity.ok(
                    savedRecords.stream()
                            .map(this::toResponse)
                            .toList()
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Error saving attendance: "
                                    + e.getMessage()
                    );
        }
    }


    /*
     * ============================================================
     * TEACHER ATTENDANCE SUMMARY
     * ============================================================
     *
     * THIS IS THE IMPORTANT MISSING ENDPOINT.
     *
     * The Teacher Dashboard calls:
     *
     * GET /api/attendance/teacher/{teacherId}/summary
     *
     * Example:
     *
     * GET /api/attendance/teacher/7/summary
     *
     * Response:
     *
     * [
     *   {
     *      studentId: 2,
     *      studentName: "Pravalika",
     *      studentEmail: "...",
     *      present: 8,
     *      absent: 2,
     *      total: 10,
     *      percentage: 80.0
     *   }
     * ]
     */
    @GetMapping("/teacher/{teacherId}/summary")
    public ResponseEntity<?> getTeacherAttendanceSummary(
            @PathVariable Long teacherId) {

        try {

            /*
             * Make sure teacher exists.
             */
            userRepository.findById(teacherId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Teacher not found."
                            )
                    );


            /*
             * Get all attendance records for this teacher.
             */
            List<Attendance> records =
                    attendanceRepository
                            .findByTeacherIdOrderByAttendanceDateAsc(
                                    teacherId
                            );


            /*
             * Group records by student.
             */
            Map<Long, Map<String, Object>> students =
                    new LinkedHashMap<>();


            for (Attendance attendance : records) {

                /*
                 * Ignore broken records.
                 */
                if (attendance.getStudent() == null) {
                    continue;
                }


                Long studentId =
                        attendance.getStudent().getId();


                /*
                 * Create student entry if it doesn't exist.
                 */
                Map<String, Object> data =
                        students.computeIfAbsent(
                                studentId,
                                id -> {

                                    Map<String, Object> row =
                                            new LinkedHashMap<>();

                                    row.put(
                                            "studentId",
                                            id
                                    );

                                    row.put(
                                            "studentName",
                                            attendance
                                                    .getStudent()
                                                    .getName()
                                    );

                                    row.put(
                                            "studentEmail",
                                            attendance
                                                    .getStudent()
                                                    .getEmail()
                                    );

                                    row.put(
                                            "present",
                                            0
                                    );

                                    row.put(
                                            "absent",
                                            0
                                    );

                                    row.put(
                                            "total",
                                            0
                                    );

                                    return row;
                                }
                        );


                /*
                 * Normalize status.
                 */
                String status =
                        attendance.getStatus() == null
                                ? ""
                                : attendance.getStatus()
                                        .trim()
                                        .toUpperCase();


                /*
                 * Count PRESENT.
                 */
                if ("PRESENT".equals(status)) {

                    data.put(
                            "present",
                            ((Integer)
                                    data.get("present"))
                                    + 1
                    );
                }


                /*
                 * Count ABSENT.
                 */
                if ("ABSENT".equals(status)) {

                    data.put(
                            "absent",
                            ((Integer)
                                    data.get("absent"))
                                    + 1
                    );
                }


                /*
                 * Count total records.
                 */
                data.put(
                        "total",
                        ((Integer)
                                data.get("total"))
                                + 1
                );
            }


            /*
             * Calculate percentage for every student.
             */
            List<Map<String, Object>> result =
                    new ArrayList<>();


            for (Map<String, Object> data :
                    students.values()) {

                int present =
                        (Integer)
                                data.get("present");

                int total =
                        (Integer)
                                data.get("total");


                double percentage =
                        total == 0
                                ? 0.0
                                : ((double) present
                                / total)
                                * 100.0;


                /*
                 * Round to one decimal place.
                 */
                double roundedPercentage =
                        Math.round(
                                percentage * 10.0
                        ) / 10.0;


                data.put(
                        "percentage",
                        roundedPercentage
                );


                result.add(data);
            }


            return ResponseEntity.ok(result);

        } catch (Exception e) {

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            "Error loading attendance summary: "
                                    + e.getMessage()
                    );
        }
    }


    /*
     * ============================================================
     * COMMON RESPONSE FORMAT
     * ============================================================
     */
    private Map<String, Object> toResponse(
            Attendance attendance) {

        Map<String, Object> row =
                new LinkedHashMap<>();


        row.put(
                "id",
                attendance.getId()
        );


        row.put(
                "studentId",
                attendance.getStudent() != null
                        ? attendance.getStudent().getId()
                        : null
        );


        row.put(
                "studentName",
                attendance.getStudent() != null
                        ? attendance.getStudent().getName()
                        : null
        );


        row.put(
                "studentEmail",
                attendance.getStudent() != null
                        ? attendance.getStudent().getEmail()
                        : null
        );


        row.put(
                "subjectId",
                attendance.getSubject() != null
                        ? attendance.getSubject().getId()
                        : null
        );


        row.put(
                "subjectName",
                attendance.getSubject() != null
                        ? attendance.getSubject().getName()
                        : null
        );


        row.put(
                "date",
                attendance.getAttendanceDate()
        );


        row.put(
                "status",
                attendance.getStatus()
        );


        return row;
    }
}