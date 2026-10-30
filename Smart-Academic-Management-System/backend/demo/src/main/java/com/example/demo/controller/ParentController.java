package com.example.demo.controller;

import com.example.demo.entity.Assessment;
import com.example.demo.entity.Attendance;
import com.example.demo.entity.ParentStudent;
import com.example.demo.entity.StudentSubject;
import com.example.demo.entity.Submission;
import com.example.demo.entity.Subject;
import com.example.demo.entity.User;

import com.example.demo.repository.AssessmentRepository;
import com.example.demo.repository.AttendanceRepository;
import com.example.demo.repository.ParentStudentRepository;
import com.example.demo.repository.StudentSubjectRepository;
import com.example.demo.repository.SubmissionRepository;
import com.example.demo.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/parents")
@CrossOrigin(origins = "*")
public class ParentController {

    private final UserRepository userRepository;
    private final ParentStudentRepository parentStudentRepository;
    private final SubmissionRepository submissionRepository;
    private final AttendanceRepository attendanceRepository;
    private final StudentSubjectRepository studentSubjectRepository;
    private final AssessmentRepository assessmentRepository;

    public ParentController(
            UserRepository userRepository,
            ParentStudentRepository parentStudentRepository,
            SubmissionRepository submissionRepository,
            AttendanceRepository attendanceRepository,
            StudentSubjectRepository studentSubjectRepository,
            AssessmentRepository assessmentRepository) {

        this.userRepository = userRepository;
        this.parentStudentRepository = parentStudentRepository;
        this.submissionRepository = submissionRepository;
        this.attendanceRepository = attendanceRepository;
        this.studentSubjectRepository = studentSubjectRepository;
        this.assessmentRepository = assessmentRepository;
    }

    // ============================================================
    // PARENT DASHBOARD
    // ============================================================

    @GetMapping("/dashboard")
    public ResponseEntity<?> getParentDashboard(
            @RequestParam String email) {

        try {

            // ----------------------------------------------------
            // FIND PARENT
            // ----------------------------------------------------

            User parent = userRepository.findAll()
                    .stream()
                    .filter(user ->
                            user.getEmail() != null
                                    && user.getEmail()
                                            .equalsIgnoreCase(email.trim()))
                    .filter(user ->
                            user.getRole() != null
                                    && user.getRole()
                                            .equalsIgnoreCase("PARENT"))
                    .findFirst()
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Parent account not found."
                            )
                    );

            // ----------------------------------------------------
            // FIND CHILD
            // ----------------------------------------------------

            ParentStudent parentStudent =
                    parentStudentRepository
                            .findByParentId(parent.getId())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "No student is assigned to this parent."
                                    )
                            );

            User student = parentStudent.getStudent();

            if (student == null) {

                throw new RuntimeException(
                        "Student is not assigned correctly."
                );
            }

            // ----------------------------------------------------
            // STUDENT SUBJECTS
            // ----------------------------------------------------

            List<StudentSubject> studentSubjects =
                    studentSubjectRepository
                            .findByStudentId(student.getId());

            // ----------------------------------------------------
            // STUDENT SUBMISSIONS
            // ----------------------------------------------------

            List<Submission> submissions =
                    submissionRepository
                            .findByStudentId(student.getId());

            // ----------------------------------------------------
            // STUDENT ATTENDANCE
            // ----------------------------------------------------

            List<Attendance> attendanceRecords =
                    attendanceRepository
                            .findByStudentIdOrderByAttendanceDateDesc(
                                    student.getId()
                            );

            // ----------------------------------------------------
            // ALL ASSESSMENTS
            // ----------------------------------------------------

            List<Assessment> allAssessments =
                    assessmentRepository.findAll();

            // ====================================================
            // SUMMARY VALUES
            // ====================================================

            double totalMarksObtained = 0.0;
            double totalMarksPossible = 0.0;

            int gradedAssessments = 0;
            int submittedAssessments = 0;

            // ====================================================
            // MARKS BY SUBJECT
            // ====================================================

            Map<Long, Map<String, Object>> marksMap =
                    new LinkedHashMap<>();

            // ====================================================
            // PERFORMANCE TREND
            // ====================================================

            List<Map<String, Object>> performanceTrend =
                    new ArrayList<>();

            // ====================================================
            // FEEDBACK
            // ====================================================

            List<Map<String, Object>> feedbackList =
                    new ArrayList<>();

            // ====================================================
            // PROCESS SUBMISSIONS
            // ====================================================

            for (Submission submission : submissions) {

                if (submission == null) {
                    continue;
                }

                Assessment assessment =
                        submission.getAssessment();

                if (assessment == null) {
                    continue;
                }

                Subject subject =
                        assessment.getSubject();

                if (subject == null) {
                    continue;
                }

                // ------------------------------------------------
                // Submitted
                // ------------------------------------------------

                submittedAssessments++;

                // ------------------------------------------------
                // Marks
                // ------------------------------------------------

                if (submission.getMarks() != null) {

                    Object totalObject =
                            assessment.getTotalMarks();

                    if (totalObject == null) {
                        continue;
                    }

                    double studentMarks =
                            submission.getMarks();

                    double assessmentTotal;

                    try {

                        assessmentTotal =
                                Double.parseDouble(
                                        totalObject.toString()
                                );

                    } catch (Exception e) {

                        continue;
                    }

                    if (assessmentTotal <= 0) {
                        continue;
                    }

                    totalMarksObtained +=
                            studentMarks;

                    totalMarksPossible +=
                            assessmentTotal;

                    gradedAssessments++;

                    // ------------------------------------------------
                    // Subject marks
                    // ------------------------------------------------

                    Long subjectId =
                            subject.getId();

                    Map<String, Object> subjectData =
                            marksMap.get(subjectId);

                    if (subjectData == null) {

                        subjectData =
                                new LinkedHashMap<>();

                        subjectData.put(
                                "subject",
                                subject.getName()
                        );

                        subjectData.put(
                                "marks",
                                0.0
                        );

                        subjectData.put(
                                "total",
                                0.0
                        );

                        marksMap.put(
                                subjectId,
                                subjectData
                        );
                    }

                    double currentMarks =
                            Double.parseDouble(
                                    subjectData
                                            .get("marks")
                                            .toString()
                            );

                    double currentTotal =
                            Double.parseDouble(
                                    subjectData
                                            .get("total")
                                            .toString()
                            );

                    subjectData.put(
                            "marks",
                            currentMarks + studentMarks
                    );

                    subjectData.put(
                            "total",
                            currentTotal + assessmentTotal
                    );

                    // ------------------------------------------------
                    // Performance trend
                    // ------------------------------------------------

                    Map<String, Object> trend =
                            new LinkedHashMap<>();

                    trend.put(
                            "label",
                            assessment.getTitle()
                    );

                    trend.put(
                            "subject",
                            subject.getName()
                    );

                    trend.put(
                            "marks",
                            studentMarks
                    );

                    trend.put(
                            "total",
                            assessmentTotal
                    );

                    trend.put(
                            "percentage",
                            round(
                                (studentMarks /
                                        assessmentTotal) * 100
                            )
                    );

                    trend.put(
                            "submittedAt",
                            submission.getSubmittedAt()
                    );

                    performanceTrend.add(trend);
                }

                // ------------------------------------------------
                // Feedback
                // ------------------------------------------------

                if (submission.getFeedback() != null
                        && !submission.getFeedback().isBlank()) {

                    Map<String, Object> feedback =
                            new LinkedHashMap<>();

                    feedback.put(
                            "subject",
                            subject.getName()
                    );

                    feedback.put(
                            "assessment",
                            assessment.getTitle()
                    );

                    if (assessment.getTeacher() != null) {

                        feedback.put(
                                "teacher",
                                assessment.getTeacher().getName()
                        );

                    } else {

                        feedback.put(
                                "teacher",
                                "Teacher"
                        );
                    }

                    feedback.put(
                            "feedback",
                            submission.getFeedback()
                    );

                    feedback.put(
                            "marks",
                            submission.getMarks()
                    );

                    Object totalObject =
                            assessment.getTotalMarks();

                    feedback.put(
                            "total",
                            totalObject
                    );

                    feedbackList.add(feedback);
                }
            }

            // ====================================================
            // FINALIZE SUBJECT MARKS
            // ====================================================

            List<Map<String, Object>> marksBySubject =
                    new ArrayList<>();

            for (Map<String, Object> data :
                    marksMap.values()) {

                double marks =
                        Double.parseDouble(
                                data.get("marks").toString()
                        );

                double total =
                        Double.parseDouble(
                                data.get("total").toString()
                        );

                double percentage =
                        total > 0
                                ? (marks / total) * 100
                                : 0;

                data.put(
                        "marks",
                        round(marks)
                );

                data.put(
                        "total",
                        round(total)
                );

                data.put(
                        "percentage",
                        round(percentage)
                );

                marksBySubject.add(data);
            }

            // ====================================================
            // ATTENDANCE BY SUBJECT
            // ====================================================

            Map<Long, Map<String, Object>> attendanceMap =
                    new LinkedHashMap<>();

            for (Attendance record :
                    attendanceRecords) {

                if (record == null
                        || record.getSubject() == null) {

                    continue;
                }

                Subject subject =
                        record.getSubject();

                Long subjectId =
                        subject.getId();

                Map<String, Object> data =
                        attendanceMap.get(subjectId);

                if (data == null) {

                    data =
                            new LinkedHashMap<>();

                    data.put(
                            "subject",
                            subject.getName()
                    );

                    data.put(
                            "total",
                            0
                    );

                    data.put(
                            "present",
                            0
                    );

                    data.put(
                            "absent",
                            0
                    );

                    attendanceMap.put(
                            subjectId,
                            data
                    );
                }

                int total =
                        Integer.parseInt(
                                data.get("total").toString()
                        );

                data.put(
                        "total",
                        total + 1
                );

                String status =
                        record.getStatus();

                if (status != null
                        && status.equalsIgnoreCase("PRESENT")) {

                    int present =
                            Integer.parseInt(
                                    data.get("present")
                                            .toString()
                            );

                    data.put(
                            "present",
                            present + 1
                    );

                } else {

                    int absent =
                            Integer.parseInt(
                                    data.get("absent")
                                            .toString()
                            );

                    data.put(
                            "absent",
                            absent + 1
                    );
                }
            }

            List<Map<String, Object>> attendanceBySubject =
                    new ArrayList<>();

            int totalAttendanceClasses = 0;
            int totalPresentClasses = 0;

            for (Map<String, Object> data :
                    attendanceMap.values()) {

                int total =
                        Integer.parseInt(
                                data.get("total").toString()
                        );

                int present =
                        Integer.parseInt(
                                data.get("present").toString()
                        );

                double percentage =
                        total > 0
                                ? (present * 100.0 / total)
                                : 0;

                totalAttendanceClasses +=
                        total;

                totalPresentClasses +=
                        present;

                data.put(
                        "percentage",
                        round(percentage)
                );

                attendanceBySubject.add(data);
            }

            // ====================================================
            // OVERALL VALUES
            // ====================================================

            double overallMarks =
                    totalMarksPossible > 0
                            ? (totalMarksObtained /
                               totalMarksPossible) * 100
                            : 0;

            double overallAttendance =
                    totalAttendanceClasses > 0
                            ? (totalPresentClasses * 100.0 /
                               totalAttendanceClasses)
                            : 0;

            // ====================================================
            // ASSESSMENT STATUS
            // ====================================================

            Set<Long> studentSubjectIds =
                    new HashSet<>();

            for (StudentSubject ss :
                    studentSubjects) {

                if (ss.getSubject() != null) {

                    studentSubjectIds.add(
                            ss.getSubject().getId()
                    );
                }
            }

            int availableAssessments = 0;

            for (Assessment assessment :
                    allAssessments) {

                if (assessment == null
                        || assessment.getSubject() == null) {

                    continue;
                }

                if (studentSubjectIds.contains(
                        assessment.getSubject().getId())) {

                    availableAssessments++;
                }
            }

            int pendingAssessments =
                    Math.max(
                            0,
                            availableAssessments -
                                    submittedAssessments
                    );

            // ====================================================
            // ROOT RESPONSE
            // ====================================================

            Map<String, Object> response =
                    new LinkedHashMap<>();

            // ----------------------------------------------------
            // Parent
            // ----------------------------------------------------

            Map<String, Object> parentData =
                    new LinkedHashMap<>();

            parentData.put(
                    "id",
                    parent.getId()
            );

            parentData.put(
                    "name",
                    parent.getName()
            );

            parentData.put(
                    "email",
                    parent.getEmail()
            );

            response.put(
                    "parent",
                    parentData
            );

            // ----------------------------------------------------
            // Student
            // ----------------------------------------------------

            Map<String, Object> studentData =
                    new LinkedHashMap<>();

            studentData.put(
                    "id",
                    student.getId()
            );

            studentData.put(
                    "name",
                    student.getName()
            );

            studentData.put(
                    "email",
                    student.getEmail()
            );

            response.put(
                    "student",
                    studentData
            );

            // ----------------------------------------------------
            // Summary
            // ----------------------------------------------------

            Map<String, Object> summary =
                    new LinkedHashMap<>();

            summary.put(
                    "overallMarks",
                    round(overallMarks)
            );

            summary.put(
                    "overallAttendance",
                    round(overallAttendance)
            );

            summary.put(
                    "subjectCount",
                    studentSubjects.size()
            );

            summary.put(
                    "completedAssessments",
                    gradedAssessments
            );

            summary.put(
                    "submittedAssessments",
                    submittedAssessments
            );

            summary.put(
                    "availableAssessments",
                    availableAssessments
            );

            summary.put(
                    "pendingAssessments",
                    pendingAssessments
            );

            response.put(
                    "summary",
                    summary
            );

            // ----------------------------------------------------
            // Graph data
            // ----------------------------------------------------

            response.put(
                    "marksBySubject",
                    marksBySubject
            );

            response.put(
                    "attendanceBySubject",
                    attendanceBySubject
            );

            performanceTrend.sort(
                    Comparator.comparing(
                            item -> {
                                Object value =
                                        item.get("submittedAt");

                                return value == null
                                        ? ""
                                        : value.toString();
                            }
                    )
            );

            response.put(
                    "performanceTrend",
                    performanceTrend
            );

            response.put(
                    "feedback",
                    feedbackList
            );

            // ----------------------------------------------------
            // Assessment status
            // ----------------------------------------------------

            Map<String, Object> assessmentStatus =
                    new LinkedHashMap<>();

            assessmentStatus.put(
                    "completed",
                    gradedAssessments
            );

            assessmentStatus.put(
                    "submitted",
                    Math.max(
                            0,
                            submittedAssessments -
                                    gradedAssessments
                    )
            );

            assessmentStatus.put(
                    "pending",
                    pendingAssessments
            );

            response.put(
                    "assessmentStatus",
                    assessmentStatus
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Unable to load parent dashboard: "
                                    + e.getMessage()
                    );
        }
    }

    // ============================================================
    // ROUND NUMBER
    // ============================================================

    private double round(double value) {

        return Math.round(value * 100.0) / 100.0;
    }
}