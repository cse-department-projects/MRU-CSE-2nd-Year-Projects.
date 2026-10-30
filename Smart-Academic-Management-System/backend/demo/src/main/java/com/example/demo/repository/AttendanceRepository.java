package com.example.demo.repository;

import com.example.demo.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByStudentIdAndSubjectIdAndAttendanceDate(
            Long studentId,
            Long subjectId,
            LocalDate attendanceDate
    );

    List<Attendance> findByTeacherIdAndAttendanceDate(
            Long teacherId,
            LocalDate attendanceDate
    );

    List<Attendance> findByTeacherIdAndSubjectIdAndAttendanceDate(
            Long teacherId,
            Long subjectId,
            LocalDate attendanceDate
    );

    List<Attendance> findByStudentIdOrderByAttendanceDateDesc(
            Long studentId
    );

    /*
     * Used by the Teacher Dashboard attendance graph.
     *
     * Returns all attendance records belonging to this teacher,
     * ordered by attendance date.
     */
    List<Attendance> findByTeacherIdOrderByAttendanceDateAsc(
            Long teacherId
    );
}