package com.example.demo.controller;

import com.example.demo.entity.EducationalMaterial;
import com.example.demo.entity.User;
import com.example.demo.repository.EducationalMaterialRepository;
import com.example.demo.service.MaterialReaderService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/materials")
@CrossOrigin(origins = "*")
public class MaterialController {

    private final MaterialReaderService materialReaderService;
    private final EducationalMaterialRepository materialRepository;

    public MaterialController(
            MaterialReaderService materialReaderService,
            EducationalMaterialRepository materialRepository) {

        this.materialReaderService = materialReaderService;
        this.materialRepository = materialRepository;
    }

    // ==========================================
    // UPLOAD EDUCATIONAL MATERIAL
    // ==========================================
    @PostMapping("/upload")
    public ResponseEntity<?> uploadMaterial(
            @RequestParam("file") MultipartFile file,
            @RequestParam("teacherId") Long teacherId) {

        try {

            // Check file
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("Please select a file.");
            }

            String fileName = file.getOriginalFilename();

            if (fileName == null || fileName.isBlank()) {
                return ResponseEntity.badRequest()
                        .body("File name is missing.");
            }

            String lowerName = fileName.toLowerCase();

            // Allow only PPTX, PDF and DOCX
            if (!lowerName.endsWith(".pptx")
                    && !lowerName.endsWith(".pdf")
                    && !lowerName.endsWith(".docx")) {

                return ResponseEntity.badRequest()
                        .body("Only PPTX, PDF and DOCX files are supported.");
            }

            // ==========================================
            // READ FILE CONTENT
            // ==========================================
            String extractedContent =
                    materialReaderService.extractText(file);

            if (extractedContent == null
                    || extractedContent.isBlank()) {

                return ResponseEntity.badRequest()
                        .body("Could not extract any text from the uploaded file.");
            }

            // ==========================================
            // CREATE EDUCATIONAL MATERIAL
            // ==========================================
            EducationalMaterial material =
                    new EducationalMaterial();

            material.setFileName(fileName);

            // Get file type
            String fileType;

            if (lowerName.endsWith(".pptx")) {
                fileType = "PPTX";
            } else if (lowerName.endsWith(".pdf")) {
                fileType = "PDF";
            } else {
                fileType = "DOCX";
            }

            material.setFileType(fileType);
            material.setContent(extractedContent);

            // ==========================================
            // SET TEACHER
            // ==========================================
            User teacher = new User();
            teacher.setId(teacherId);

            material.setTeacher(teacher);

            // ==========================================
            // SAVE TO MYSQL
            // ==========================================
            EducationalMaterial savedMaterial =
                    materialRepository.save(material);

            return ResponseEntity.ok(savedMaterial);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());

        } catch (IOException e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error reading the uploaded file: "
                            + e.getMessage());

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error uploading material: "
                            + e.getMessage());
        }
    }

    // ==========================================
    // GET ALL MATERIALS
    // ==========================================
    @GetMapping
    public ResponseEntity<List<EducationalMaterial>> getAllMaterials() {

        List<EducationalMaterial> materials =
                materialRepository.findAll();

        return ResponseEntity.ok(materials);
    }

    // ==========================================
    // GET MATERIALS OF A TEACHER
    // ==========================================
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<EducationalMaterial>> getTeacherMaterials(
            @PathVariable Long teacherId) {

        List<EducationalMaterial> materials =
                materialRepository.findByTeacherId(teacherId);

        return ResponseEntity.ok(materials);
    }

    // ==========================================
    // GET ONE MATERIAL
    // ==========================================
    @GetMapping("/{id}")
    public ResponseEntity<?> getMaterial(
            @PathVariable Long id) {

        return materialRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build());
    }

    // ==========================================
    // DELETE MATERIAL
    // ==========================================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMaterial(
            @PathVariable Long id) {

        if (!materialRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        materialRepository.deleteById(id);

        return ResponseEntity.ok(
                "Educational material deleted successfully."
        );
    }
}