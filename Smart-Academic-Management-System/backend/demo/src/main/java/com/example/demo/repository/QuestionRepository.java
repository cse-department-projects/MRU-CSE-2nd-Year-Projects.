package com.example.demo.repository;

import com.example.demo.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByTeacherId(Long teacherId);

    List<Question> findBySubjectId(Long subjectId);

    List<Question> findByTeacherIdAndSubjectId(
            Long teacherId,
            Long subjectId
    );
}