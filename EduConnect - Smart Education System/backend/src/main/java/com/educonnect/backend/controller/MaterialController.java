package com.educonnect.backend.controller;

import com.educonnect.backend.entity.Material;
import com.educonnect.backend.repository.MaterialRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/materials")
@CrossOrigin(origins = "*")
public class MaterialController {

    private final MaterialRepository materialRepository;

    public MaterialController(MaterialRepository materialRepository) {
        this.materialRepository = materialRepository;
    }

    @GetMapping
    public List<Material> getAllMaterials() {
        return materialRepository.findAll();
    }

    @GetMapping("/student/{studentId}")
    public List<Material> getStudentMaterials(
            @PathVariable Long studentId) {

        return materialRepository.findByStudentId(studentId);
    }

    @PostMapping
    public Material createMaterial(
            @RequestBody Material material) {
        if (material.getUpdatedDate() == null) {
            material.setUpdatedDate(LocalDate.now());
        }
        return materialRepository.save(material);
    }

    @PutMapping("/{id}")
    public Material updateMaterial(
            @PathVariable Long id,
            @RequestBody Material updated) {
        return materialRepository.findById(id).map(m -> {
            m.setTitle(updated.getTitle());
            m.setSubject(updated.getSubject());
            m.setType(updated.getType());
            m.setDescription(updated.getDescription());
            m.setResourceInfo(updated.getResourceInfo());
            if (updated.getUpdatedDate() != null) {
                m.setUpdatedDate(updated.getUpdatedDate());
            } else {
                m.setUpdatedDate(LocalDate.now());
            }
            if (updated.getStudentId() != null) {
                m.setStudentId(updated.getStudentId());
            }
            return materialRepository.save(m);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Material not found"));
    }

    @DeleteMapping("/{id}")
    public void deleteMaterial(@PathVariable Long id) {
        if (!materialRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Material not found");
        }
        materialRepository.deleteById(id);
    }
}