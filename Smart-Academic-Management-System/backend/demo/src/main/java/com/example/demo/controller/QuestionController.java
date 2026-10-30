package com.example.demo.controller;

import com.example.demo.entity.Question;
import com.example.demo.entity.Subject;
import com.example.demo.entity.User;
import com.example.demo.repository.QuestionRepository;
import com.example.demo.repository.SubjectRepository;
import com.example.demo.repository.UserRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "*")
public class QuestionController {

    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;

    public QuestionController(
            QuestionRepository questionRepository,
            UserRepository userRepository,
            SubjectRepository subjectRepository) {

        this.questionRepository = questionRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
    }

    // =========================================
    // CREATE ONE QUESTION
    // =========================================

    @PostMapping
    public Question createQuestion(@RequestBody QuestionRequest request) {

        // Validate teacher
        if (request.teacherId == null) {
            throw new RuntimeException("Teacher ID is required");
        }

        // Validate subject
        if (request.subjectId == null) {
            throw new RuntimeException("Subject ID is required");
        }

        // Validate question text
        if (request.questionText == null ||
                request.questionText.trim().isEmpty()) {

            throw new RuntimeException("Question text is required");
        }

        // Find teacher
        User teacher = userRepository.findById(request.teacherId)
                .orElseThrow(() ->
                        new RuntimeException("Teacher not found"));

        // Find subject
        Subject subject = subjectRepository.findById(request.subjectId)
                .orElseThrow(() ->
                        new RuntimeException("Subject not found"));

        // Make sure subject belongs to this teacher
        if (subject.getTeacher() == null ||
                !subject.getTeacher().getId().equals(teacher.getId())) {

            throw new RuntimeException(
                    "This subject does not belong to this teacher");
        }

        // =========================================
        // CREATE A BRAND NEW QUESTION OBJECT
        // =========================================

        Question question = new Question();

        question.setTeacher(teacher);
        question.setSubject(subject);

        // IMPORTANT:
        // Set the text directly.
        // Do NOT append to an existing question.
        question.setQuestionText(request.questionText.trim());

        question.setQuestionType(request.questionType);

        // MCQ options
        question.setOptionA(request.optionA);
        question.setOptionB(request.optionB);
        question.setOptionC(request.optionC);
        question.setOptionD(request.optionD);

        question.setCorrectAnswer(request.correctAnswer);

        // Marks
        question.setMarks(
                request.marks != null ? request.marks : 1
        );

        // =========================================
        // SAVE EXACTLY THIS ONE QUESTION
        // =========================================

        return questionRepository.save(question);
    }

    // =========================================
    // GET ALL QUESTIONS OF A TEACHER
    // =========================================

    @GetMapping("/teacher/{teacherId}")
    public List<Question> getTeacherQuestions(
            @PathVariable Long teacherId) {

        return questionRepository.findByTeacherId(teacherId);
    }

    // =========================================
    // GET ALL QUESTIONS OF A SUBJECT
    // =========================================

    @GetMapping("/subject/{subjectId}")
    public List<Question> getSubjectQuestions(
            @PathVariable Long subjectId) {

        return questionRepository.findBySubjectId(subjectId);
    }

    // =========================================
    // REQUEST CLASS
    // =========================================

    public static class QuestionRequest {

        public Long teacherId;
        public Long subjectId;

        public String questionText;
        public String questionType;

        public String optionA;
        public String optionB;
        public String optionC;
        public String optionD;

        public String correctAnswer;

        public Integer marks;
    }
}