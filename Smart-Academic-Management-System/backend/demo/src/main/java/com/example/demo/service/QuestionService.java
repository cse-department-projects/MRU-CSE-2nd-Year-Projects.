package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.entity.Question;
import com.example.demo.repository.QuestionRepository;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;

    public QuestionService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    // Save exactly one question
    public Question saveQuestion(Question question) {
        return questionRepository.save(question);
    }

    // Get all questions created by a teacher
    public List<Question> getQuestionsByTeacher(Long teacherId) {
        return questionRepository.findByTeacherId(teacherId);
    }

    // Get question by ID
    public Question getQuestionById(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with ID: " + id));
    }

    // Delete question
    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new RuntimeException("Question not found with ID: " + id);
        }

        questionRepository.deleteById(id);
    }
}