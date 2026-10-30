package com.example.demo.service;

import com.example.demo.entity.Assessment;
import com.example.demo.repository.AssessmentRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;

    public AssessmentService(
            AssessmentRepository assessmentRepository) {

        this.assessmentRepository =
                assessmentRepository;
    }

    // Save assessment
    public Assessment saveAssessment(
            Assessment assessment) {

        return assessmentRepository.save(
                assessment
        );
    }

    // Get all assessments
    public List<Assessment> getAllAssessments() {

        return assessmentRepository.findAll();
    }

    // Get assessments created by teacher
    public List<Assessment> getAssessmentsByTeacher(
            Long teacherId) {

        return assessmentRepository
                .findByTeacherId(teacherId);
    }

    // Get assessments for subject
    public List<Assessment> getAssessmentsBySubject(
            Long subjectId) {

        return assessmentRepository
                .findBySubjectId(subjectId);
    }

    // Get one assessment
    public Assessment getAssessmentById(
            Long id) {

        return assessmentRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Assessment not found"
                        )
                );
    }

    // Delete assessment
    public void deleteAssessment(Long id) {

        if (!assessmentRepository.existsById(id)) {

            throw new RuntimeException(
                    "Assessment not found"
            );
        }

        assessmentRepository.deleteById(id);
    }
}