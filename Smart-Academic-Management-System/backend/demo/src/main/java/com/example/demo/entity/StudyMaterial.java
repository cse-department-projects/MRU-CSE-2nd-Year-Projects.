package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "study_materials")
public class StudyMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Student who created the study material
    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    // Subject related to the study material
    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    // Study material content
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    // Default constructor
    public StudyMaterial() {
    }

    // Constructor
    public StudyMaterial(User student, Subject subject, String content) {
        this.student = student;
        this.subject = subject;
        this.content = content;
    }

    // ID
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // Student
    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    // Subject
    public Subject getSubject() {
        return subject;
    }

    public void setSubject(Subject subject) {
        this.subject = subject;
    }

    // Content
    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
