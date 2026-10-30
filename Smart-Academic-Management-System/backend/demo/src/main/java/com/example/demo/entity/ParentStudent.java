package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "parent_students",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_parent_student_parent",
            columnNames = "parent_id"
        ),
        @UniqueConstraint(
            name = "uk_parent_student_student",
            columnNames = "student_id"
        )
    }
)
public class ParentStudent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "parent_id", nullable = false)
    private User parent;

    @OneToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    public ParentStudent() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getParent() {
        return parent;
    }

    public void setParent(User parent) {
        this.parent = parent;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }
}