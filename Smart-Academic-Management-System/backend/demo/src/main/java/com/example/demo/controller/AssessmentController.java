package com.example.demo.controller;

import com.example.demo.entity.Assessment;
import com.example.demo.entity.Question;
import com.example.demo.entity.Subject;
import com.example.demo.entity.User;

import com.example.demo.repository.AssessmentRepository;
import com.example.demo.repository.QuestionRepository;
import com.example.demo.repository.SubjectRepository;
import com.example.demo.repository.UserRepository;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/assessments")
@CrossOrigin(origins = "*")
public class AssessmentController {

    private final AssessmentRepository assessmentRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final QuestionRepository questionRepository;

    public AssessmentController(
            AssessmentRepository assessmentRepository,
            UserRepository userRepository,
            SubjectRepository subjectRepository,
            QuestionRepository questionRepository) {

        this.assessmentRepository = assessmentRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
        this.questionRepository = questionRepository;
    }

    // =====================================================
    // CREATE ASSESSMENT
    // =====================================================

    @PostMapping
    @Transactional
    public Assessment createAssessment(
            @RequestBody AssessmentRequest request) {

        // -------------------------------------------------
        // VALIDATE REQUEST
        // -------------------------------------------------

        if (request == null) {
            throw new RuntimeException("Assessment data is required");
        }

        if (request.teacherId == null) {
            throw new RuntimeException("Teacher ID is required");
        }

        if (request.subjectId == null) {
            throw new RuntimeException("Subject ID is required");
        }

        if (request.title == null ||
                request.title.trim().isEmpty()) {

            throw new RuntimeException("Assessment title is required");
        }

        if (request.assessmentType == null ||
                request.assessmentType.trim().isEmpty()) {

            throw new RuntimeException(
                    "Assessment type is required");
        }

        if (request.startDate == null) {
            throw new RuntimeException(
                    "Assessment start date is required");
        }

        if (request.dueDate == null) {
            throw new RuntimeException(
                    "Assessment due date is required");
        }

        if (request.dueDate.isBefore(request.startDate)) {
            throw new RuntimeException(
                    "Due date cannot be before start date");
        }

        if (request.totalMarks == null ||
                request.totalMarks < 1) {

            throw new RuntimeException(
                    "Total marks must be at least 1");
        }

        // -------------------------------------------------
        // FIND TEACHER
        // -------------------------------------------------

        User teacher = userRepository
                .findById(request.teacherId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Teacher not found: "
                                        + request.teacherId));

        // -------------------------------------------------
        // FIND SUBJECT
        // -------------------------------------------------

        Subject subject = subjectRepository
                .findById(request.subjectId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Subject not found: "
                                        + request.subjectId));

        // -------------------------------------------------
        // CHECK SUBJECT BELONGS TO TEACHER
        // -------------------------------------------------

        if (subject.getTeacher() == null ||
                subject.getTeacher().getId() == null ||
                !subject.getTeacher()
                        .getId()
                        .equals(teacher.getId())) {

            throw new RuntimeException(
                    "This subject does not belong to this teacher");
        }

        // -------------------------------------------------
        // CREATE ASSESSMENT
        // -------------------------------------------------

        Assessment assessment = new Assessment();

        assessment.setTitle(request.title.trim());
        assessment.setAssessmentType(
                request.assessmentType.trim().toUpperCase());

        assessment.setTeacher(teacher);
        assessment.setSubject(subject);

        assessment.setStartDate(request.startDate);
        assessment.setDueDate(request.dueDate);

        assessment.setTotalMarks(request.totalMarks);

        if (request.description != null) {
            assessment.setDescription(
                    request.description.trim());
        }

        // -------------------------------------------------
        // LOAD AND VALIDATE SELECTED QUESTIONS
        // -------------------------------------------------

        List<Question> selectedQuestions =
                new ArrayList<>();

        if (request.questionIds != null &&
                !request.questionIds.isEmpty()) {

            for (Long questionId : request.questionIds) {

                if (questionId == null) {
                    continue;
                }

                Question question =
                        questionRepository
                                .findById(questionId)
                                .orElseThrow(() ->
                                        new RuntimeException(
                                                "Question not found: "
                                                        + questionId));

                // -----------------------------------------
                // QUESTION MUST BELONG TO SAME SUBJECT
                // -----------------------------------------

                if (question.getSubject() == null ||
                        question.getSubject().getId() == null ||
                        !question.getSubject()
                                .getId()
                                .equals(subject.getId())) {

                    throw new RuntimeException(
                            "Question "
                                    + questionId
                                    + " does not belong to the selected subject");
                }

                // -----------------------------------------
                // QUESTION MUST BELONG TO SAME TEACHER
                // -----------------------------------------

                if (question.getTeacher() == null ||
                        question.getTeacher().getId() == null ||
                        !question.getTeacher()
                                .getId()
                                .equals(teacher.getId())) {

                    throw new RuntimeException(
                            "Question "
                                    + questionId
                                    + " does not belong to this teacher");
                }

                // -----------------------------------------
                // PREVENT DUPLICATES
                // -----------------------------------------

                boolean alreadySelected =
                        selectedQuestions.stream()
                                .anyMatch(q ->
                                        q.getId()
                                                .equals(question.getId()));

                if (!alreadySelected) {
                    selectedQuestions.add(question);
                }
            }
        }

        // -------------------------------------------------
        // ASSESSMENT MUST HAVE AT LEAST ONE QUESTION
        // -------------------------------------------------

        if (selectedQuestions.isEmpty()) {
            throw new RuntimeException(
                    "Please select at least one question for the assessment");
        }

        // -------------------------------------------------
        // ATTACH QUESTIONS TO ASSESSMENT
        // -------------------------------------------------

        assessment.setQuestions(selectedQuestions);

        // -------------------------------------------------
        // SAVE ASSESSMENT + JOIN TABLE
        // -------------------------------------------------

        Assessment savedAssessment =
                assessmentRepository.saveAndFlush(assessment);

        // -------------------------------------------------
        // RETURN SAVED ASSESSMENT
        // -------------------------------------------------

        return savedAssessment;
    }

    // =====================================================
    // GET ALL ASSESSMENTS
    // =====================================================

    @GetMapping
    public List<Assessment> getAllAssessments() {

        return assessmentRepository.findAll();
    }

    // =====================================================
    // GET TEACHER ASSESSMENTS
    // =====================================================

    @GetMapping("/teacher/{teacherId}")
    public List<Assessment> getTeacherAssessments(
            @PathVariable Long teacherId) {

        return assessmentRepository
                .findByTeacherId(teacherId);
    }

    // =====================================================
    // GET SUBJECT ASSESSMENTS
    // =====================================================

    @GetMapping("/subject/{subjectId}")
    public List<Assessment> getSubjectAssessments(
            @PathVariable Long subjectId) {

        return assessmentRepository
                .findBySubjectId(subjectId);
    }

    // =====================================================
    // GET ONE ASSESSMENT
    // =====================================================

    @GetMapping("/{id}")
    public Assessment getAssessment(
            @PathVariable Long id) {

        return assessmentRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Assessment not found: "
                                        + id));
    }

    // =====================================================
    // DELETE ASSESSMENT
    // =====================================================

    @DeleteMapping("/{id}")
    @Transactional
    public String deleteAssessment(
            @PathVariable Long id) {

        if (!assessmentRepository.existsById(id)) {

            throw new RuntimeException(
                    "Assessment not found: " + id);
        }

        assessmentRepository.deleteById(id);

        return "Assessment deleted successfully";
    }

    // =====================================================
    // REQUEST CLASS
    // =====================================================

    public static class AssessmentRequest {

        public Long teacherId;

        public Long subjectId;

        public String title;

        public String assessmentType;

        public LocalDate startDate;

        public LocalDate dueDate;

        public Integer totalMarks;

        public String description;

        // IDs selected by the teacher
        public List<Long> questionIds;
    }
}

