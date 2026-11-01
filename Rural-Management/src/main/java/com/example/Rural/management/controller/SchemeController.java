package com.example.Rural.management.controller;

import com.example.Rural.management.model.Scheme;
import com.example.Rural.management.service.SchemeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schemes")
@CrossOrigin(origins = "*")
public class SchemeController {

    private final SchemeService schemeService;

    public SchemeController(SchemeService schemeService) {
        this.schemeService = schemeService;
    }

    @GetMapping
    public List<Scheme> getAllSchemes() {
        return schemeService.getAllSchemes();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Scheme> getSchemeById(@PathVariable Long id) {
        return ResponseEntity.ok(schemeService.getSchemeById(id));
    }

    @GetMapping("/category/{category}")
    public List<Scheme> getSchemesByCategory(@PathVariable String category) {
        return schemeService.getSchemesByCategory(category);
    }

    @PostMapping
    public ResponseEntity<Scheme> createScheme(@Valid @RequestBody Scheme scheme) {
        Scheme created = schemeService.createScheme(scheme);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Scheme> updateScheme(@PathVariable Long id,
                                                @Valid @RequestBody Scheme scheme) {
        return ResponseEntity.ok(schemeService.updateScheme(id, scheme));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteScheme(@PathVariable Long id) {
        schemeService.deleteScheme(id);
        return ResponseEntity.noContent().build();
    }
}
