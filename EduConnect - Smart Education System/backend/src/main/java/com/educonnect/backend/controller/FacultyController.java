package com.educonnect.backend.controller;

import com.educonnect.backend.entity.Faculty;
import com.educonnect.backend.repository.FacultyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/faculty")
@CrossOrigin(origins = "*")
public class FacultyController {

    private final FacultyRepository facultyRepository;

    public FacultyController(FacultyRepository facultyRepository) {
        this.facultyRepository = facultyRepository;
    }

    @GetMapping
    public List<Faculty> getAllFaculty() {
        return facultyRepository.findAll();
    }

    @GetMapping("/{id}")
    public Faculty getFacultyById(@PathVariable Long id) {
        return facultyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Faculty member not found"));
    }

    @PostMapping
    public Faculty createFaculty(@RequestBody Faculty faculty) {
        return facultyRepository.save(faculty);
    }

    @PutMapping("/{id}")
    public Faculty updateFaculty(@PathVariable Long id, @RequestBody Faculty updated) {
        return facultyRepository.findById(id).map(f -> {
            f.setName(updated.getName());
            f.setEmail(updated.getEmail());
            f.setDepartment(updated.getDepartment());
            f.setDesignation(updated.getDesignation());
            f.setPhone(updated.getPhone());
            return facultyRepository.save(f);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Faculty member not found"));
    }

    @DeleteMapping("/{id}")
    public void deleteFaculty(@PathVariable Long id) {
        if (!facultyRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Faculty member not found");
        }
        facultyRepository.deleteById(id);
    }
}
