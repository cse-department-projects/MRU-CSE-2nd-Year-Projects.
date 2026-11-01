package com.educonnect.backend.controller;

import com.educonnect.backend.entity.Result;
import com.educonnect.backend.repository.ResultRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/results")
@CrossOrigin(origins = "*")
public class ResultController {

    private final ResultRepository resultRepository;

    public ResultController(ResultRepository resultRepository) {
        this.resultRepository = resultRepository;
    }

    @GetMapping
    public List<Result> getAllResults() {
        return resultRepository.findAll();
    }

    @GetMapping("/student/{studentId}")
    public List<Result> getStudentResults(@PathVariable Long studentId) {
        return resultRepository.findByStudentId(studentId);
    }

    @PostMapping
    public Result saveOrUpdateResult(@RequestBody Result result) {
        // Validation
        if (result.getInternalMax() <= 0) result.setInternalMax(30);
        if (result.getAssignmentMax() <= 0) result.setAssignmentMax(20);
        if (result.getQuizMax() <= 0) result.setQuizMax(50);

        if (result.getInternalMarks() < 0 || result.getInternalMarks() > result.getInternalMax()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Internal marks out of valid range");
        }
        if (result.getAssignmentMarks() < 0 || result.getAssignmentMarks() > result.getAssignmentMax()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assignment marks out of valid range");
        }
        if (result.getQuizMarks() < 0 || result.getQuizMarks() > result.getQuizMax()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz marks out of valid range");
        }

        // Calculate percentage and grade
        double totalObtained = result.getInternalMarks() + result.getAssignmentMarks() + result.getQuizMarks();
        double totalMax = result.getInternalMax() + result.getAssignmentMax() + result.getQuizMax();
        double percentage = totalMax > 0 ? (totalObtained / totalMax) * 100.0 : 0.0;
        percentage = Math.round(percentage * 10.0) / 10.0;
        result.setPercentage(percentage);

        if (result.getGrade() == null || result.getGrade().isEmpty()) {
            result.setGrade(calculateGrade(percentage));
        }

        // Check if existing record for student + subject
        if (result.getId() != null) {
            return resultRepository.save(result);
        }

        Optional<Result> existing = resultRepository.findByStudentIdAndSubject(result.getStudentId(), result.getSubject());
        if (existing.isPresent()) {
            Result r = existing.get();
            r.setInternalMarks(result.getInternalMarks());
            r.setInternalMax(result.getInternalMax());
            r.setAssignmentMarks(result.getAssignmentMarks());
            r.setAssignmentMax(result.getAssignmentMax());
            r.setQuizMarks(result.getQuizMarks());
            r.setQuizMax(result.getQuizMax());
            r.setPercentage(result.getPercentage());
            r.setGrade(result.getGrade());
            return resultRepository.save(r);
        }

        return resultRepository.save(result);
    }

    @PutMapping("/{id}")
    public Result updateResult(@PathVariable Long id, @RequestBody Result updated) {
        return resultRepository.findById(id).map(r -> {
            r.setSubject(updated.getSubject());
            r.setInternalMarks(updated.getInternalMarks());
            r.setInternalMax(updated.getInternalMax() > 0 ? updated.getInternalMax() : 30);
            r.setAssignmentMarks(updated.getAssignmentMarks());
            r.setAssignmentMax(updated.getAssignmentMax() > 0 ? updated.getAssignmentMax() : 20);
            r.setQuizMarks(updated.getQuizMarks());
            r.setQuizMax(updated.getQuizMax() > 0 ? updated.getQuizMax() : 50);

            double totalObtained = r.getInternalMarks() + r.getAssignmentMarks() + r.getQuizMarks();
            double totalMax = r.getInternalMax() + r.getAssignmentMax() + r.getQuizMax();
            double pct = totalMax > 0 ? (totalObtained / totalMax) * 100.0 : 0.0;
            pct = Math.round(pct * 10.0) / 10.0;
            r.setPercentage(pct);
            r.setGrade(calculateGrade(pct));
            return resultRepository.save(r);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Result not found"));
    }

    @DeleteMapping("/{id}")
    public void deleteResult(@PathVariable Long id) {
        if (!resultRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Result not found");
        }
        resultRepository.deleteById(id);
    }

    private String calculateGrade(double pct) {
        if (pct >= 90) return "A+";
        if (pct >= 80) return "A";
        if (pct >= 70) return "B+";
        if (pct >= 60) return "B";
        if (pct >= 50) return "C";
        if (pct >= 40) return "D";
        return "F";
    }
}