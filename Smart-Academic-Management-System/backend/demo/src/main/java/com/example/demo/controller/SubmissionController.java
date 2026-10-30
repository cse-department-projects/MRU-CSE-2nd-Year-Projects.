package com.example.demo.controller;

import com.example.demo.entity.Assessment;
import com.example.demo.entity.Submission;
import com.example.demo.entity.User;
import com.example.demo.repository.AssessmentRepository;
import com.example.demo.repository.SubmissionRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/submissions")
@CrossOrigin(origins = "*")
public class SubmissionController {

    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final AssessmentRepository assessmentRepository;

    private final String uploadDirectory = "uploads/submissions";

    public SubmissionController(
            SubmissionRepository submissionRepository,
            UserRepository userRepository,
            AssessmentRepository assessmentRepository) {
        this.submissionRepository = submissionRepository;
        this.userRepository = userRepository;
        this.assessmentRepository = assessmentRepository;
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitWork(
            @RequestParam("studentId") Long studentId,
            @RequestParam("assessmentId") Long assessmentId,
            @RequestParam(value = "answerText", required = false) String answerText,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            User student = userRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));

            Assessment assessment = assessmentRepository.findById(assessmentId)
                    .orElseThrow(() -> new RuntimeException("Assessment not found with ID: " + assessmentId));

            boolean hasText = answerText != null && !answerText.trim().isEmpty();
            boolean hasFile = file != null && !file.isEmpty();

            if (!hasText && !hasFile) {
                return ResponseEntity.badRequest().body("Please write an answer or upload a file.");
            }

            if (!submissionRepository.findByStudentIdAndAssessmentId(studentId, assessmentId).isEmpty()) {
                return ResponseEntity.badRequest().body("You have already submitted this assessment.");
            }

            Submission submission = new Submission();
            submission.setStudent(student);
            submission.setAssessment(assessment);
            submission.setAnswerText(answerText);
            submission.setSubmittedAt(LocalDateTime.now());
            submission.setStatus("SUBMITTED");

            if (hasFile) {
                Path uploadPath = Paths.get(uploadDirectory).toAbsolutePath().normalize();
                Files.createDirectories(uploadPath);

                String originalFileName = file.getOriginalFilename();
                if (originalFileName == null || originalFileName.isBlank()) {
                    return ResponseEntity.badRequest().body("Invalid file name.");
                }

                String cleanName = Paths.get(originalFileName).getFileName().toString();
                String safeFileName = System.currentTimeMillis() + "_" + cleanName;
                Path filePath = uploadPath.resolve(safeFileName).normalize();

                if (!filePath.startsWith(uploadPath)) {
                    return ResponseEntity.badRequest().body("Invalid file name.");
                }

                Files.copy(file.getInputStream(), filePath);
                submission.setFileName(originalFileName);
                submission.setFilePath(filePath.toString());
            }

            return ResponseEntity.ok(submissionRepository.save(submission));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving uploaded file: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error submitting work: " + e.getMessage());
        }
    }

    // ============================================================
    // STUDENT - SAVE AUTOMATIC QUIZ MARKS
    // ============================================================

    @PostMapping("/quiz")
    public ResponseEntity<?> saveQuizMarks(
            @RequestBody Map<String, Object> request) {

        try {
            Long studentId = Long.valueOf(
                    String.valueOf(request.get("studentId"))
            );

            Long assessmentId = Long.valueOf(
                    String.valueOf(request.get("assessmentId"))
            );

            Double marks = Double.valueOf(
                    String.valueOf(request.get("marks"))
            );

            Double totalMarks = Double.valueOf(
                    String.valueOf(request.get("totalMarks"))
            );

            User student = userRepository.findById(studentId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Student not found with ID: " + studentId));

            Assessment assessment = assessmentRepository.findById(assessmentId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Assessment not found with ID: " + assessmentId));

            List<Submission> existing =
                    submissionRepository.findByStudentIdAndAssessmentId(
                            studentId, assessmentId);

            Submission submission;

            if (existing.isEmpty()) {
                submission = new Submission();
                submission.setStudent(student);
                submission.setAssessment(assessment);
                submission.setSubmittedAt(LocalDateTime.now());
            } else {
                submission = existing.get(0);
            }

            submission.setMarks(marks);
            submission.setStatus("REVIEWED");
            submission.setAnswerText(
                    "Automatic Quiz Result: "
                            + marks
                            + " / "
                            + totalMarks
            );

            if (submission.getFeedback() == null
                    || submission.getFeedback().isBlank()) {
                submission.setFeedback(
                        "Quiz automatically graded by the system."
                );
            }

            return ResponseEntity.ok(
                    submissionRepository.save(submission)
            );

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving quiz marks: " + e.getMessage());
        }
    }


    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Submission>> getStudentSubmissions(@PathVariable Long studentId) {
        return ResponseEntity.ok(submissionRepository.findByStudentId(studentId));
    }

    @GetMapping("/assessment/{assessmentId}")
    public ResponseEntity<List<Submission>> getAssessmentSubmissions(@PathVariable Long assessmentId) {
        return ResponseEntity.ok(submissionRepository.findByAssessmentId(assessmentId));
    }

    @GetMapping("/student/{studentId}/assessment/{assessmentId}")
    public ResponseEntity<?> getStudentAssessmentSubmission(
            @PathVariable Long studentId,
            @PathVariable Long assessmentId) {
        List<Submission> submissions = submissionRepository
                .findByStudentIdAndAssessmentId(studentId, assessmentId);

        if (submissions.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(submissions.get(0));
    }

    @GetMapping("/{submissionId}/file")
    public ResponseEntity<?> getSubmissionFile(@PathVariable Long submissionId) {
        try {
            Submission submission = submissionRepository.findById(submissionId)
                    .orElseThrow(() -> new RuntimeException("Submission not found."));

            if (submission.getFilePath() == null || submission.getFilePath().isBlank()) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get(submission.getFilePath()).toAbsolutePath().normalize();
            if (!Files.exists(filePath) || !Files.isRegularFile(filePath)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(filePath.toUri());
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + submission.getFileName().replace("\"", "") + "\"")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unable to open submitted file: " + e.getMessage());
        }
    }

    @PutMapping("/{submissionId}/marks")
    public ResponseEntity<?> giveMarks(
            @PathVariable Long submissionId,
            @RequestParam("marks") Double marks) {
        try {
            if (marks == null || marks < 0) {
                return ResponseEntity.badRequest().body("Marks cannot be negative.");
            }

            Submission submission = submissionRepository.findById(submissionId)
                    .orElseThrow(() -> new RuntimeException("Submission not found."));

            submission.setMarks(marks);
            submission.setStatus("REVIEWED");
            return ResponseEntity.ok(submissionRepository.save(submission));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating marks: " + e.getMessage());
        }
    }

    @PutMapping("/{submissionId}/feedback")
    public ResponseEntity<?> giveFeedback(
            @PathVariable Long submissionId,
            @RequestParam("feedback") String feedback) {
        try {
            Submission submission = submissionRepository.findById(submissionId)
                    .orElseThrow(() -> new RuntimeException("Submission not found."));

            submission.setFeedback(feedback);
            submission.setStatus("REVIEWED");
            return ResponseEntity.ok(submissionRepository.save(submission));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving feedback: " + e.getMessage());
        }
    }

    // ============================================================
    // STUDENT - DELETE OWN SUBMISSION
    // ============================================================

    @DeleteMapping("/{submissionId}")
    public ResponseEntity<?> deleteSubmission(
            @PathVariable Long submissionId,
            @RequestParam("studentId") Long studentId) {

        try {
            Submission submission = submissionRepository.findById(submissionId)
                    .orElseThrow(() ->
                            new RuntimeException("Submission not found."));

            if (submission.getStudent() == null
                    || submission.getStudent().getId() == null
                    || !submission.getStudent().getId().equals(studentId)) {

                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can only delete your own submission.");
            }

            if (submission.getFilePath() != null
                    && !submission.getFilePath().isBlank()) {
                try {
                    Path filePath = Paths.get(submission.getFilePath());
                    if (Files.exists(filePath)) {
                        Files.delete(filePath);
                    }
                } catch (Exception e) {
                    System.out.println("Could not delete uploaded file: " + e.getMessage());
                }
            }

            submissionRepository.delete(submission);

            return ResponseEntity.ok("Submission deleted successfully.");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting submission: " + e.getMessage());
        }
    }

}
