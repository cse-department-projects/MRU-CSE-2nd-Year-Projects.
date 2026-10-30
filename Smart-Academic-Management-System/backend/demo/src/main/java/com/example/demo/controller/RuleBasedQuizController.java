package com.example.demo.controller;

import com.example.demo.dto.AiQuizRequest;
import com.example.demo.entity.EducationalMaterial;
import com.example.demo.repository.EducationalMaterialRepository;
import com.example.demo.service.RuleBasedQuizGeneratorService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz-generator")
@CrossOrigin(origins = "*")
public class RuleBasedQuizController {

    private final RuleBasedQuizGeneratorService quizGeneratorService;
    private final EducationalMaterialRepository materialRepository;

    public RuleBasedQuizController(
            RuleBasedQuizGeneratorService quizGeneratorService,
            EducationalMaterialRepository materialRepository) {

        this.quizGeneratorService = quizGeneratorService;
        this.materialRepository = materialRepository;
    }

    /*
     * =====================================================
     * GET EDUCATIONAL MATERIALS FOR TEACHER
     * =====================================================
     */

    @GetMapping("/materials")
    public ResponseEntity<?> getTeacherMaterials(
            @RequestParam Long teacherId) {

        try {

            if (teacherId == null) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "error",
                                "Teacher ID is required"
                        ));
            }

            List<EducationalMaterial> materials =
                    materialRepository.findByTeacherId(teacherId);

            List<Map<String, Object>> result =
                    materials.stream()
                            .map(material -> {

                                Map<String, Object> item =
                                        new HashMap<>();

                                item.put(
                                        "id",
                                        material.getId()
                                );

                                item.put(
                                        "fileName",
                                        material.getFileName()
                                );

                                item.put(
                                        "fileType",
                                        material.getFileType()
                                );

                                return item;
                            })
                            .toList();

            return ResponseEntity.ok(result);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "error",
                            "Unable to load educational materials",
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Unknown error"
                    ));
        }
    }


    /*
     * =====================================================
     * GENERATE RULE-BASED QUIZ
     * =====================================================
     */

    @PostMapping("/generate")
    public ResponseEntity<?> generateQuiz(
            @RequestBody AiQuizRequest request) {

        try {

            if (request == null) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "error",
                                "Quiz request is required"
                        ));
            }


            /*
             * SUBJECT
             */

            if (request.getSubjectId() == null) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "error",
                                "Subject is required"
                        ));
            }


            /*
             * MATERIAL
             */

            if (request.getMaterialId() == null) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "error",
                                "Educational material is required. Please select an uploaded material."
                        ));
            }


            /*
             * TOPIC
             */

            if (request.getTopic() == null ||
                    request.getTopic().trim().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "error",
                                "Topic is required"
                        ));
            }


            /*
             * QUESTION COUNT
             */

            if (request.getNumberOfQuestions() == null ||
                    request.getNumberOfQuestions() <= 0) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "error",
                                "Number of questions must be greater than 0"
                        ));
            }


            /*
             * RULE-BASED GENERATION
             *
             * Reads only the selected teacher material.
             * No OpenAI.
             * No API key.
             * No external AI service.
             */

            List<Map<String, Object>> questions =
                    quizGeneratorService.generateQuiz(request);


            /*
             * RETURN QUESTIONS
             */

            return ResponseEntity.ok(questions);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "error",
                            e.getMessage()
                    ));

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "error",
                            "Unable to generate quiz",
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Unknown error"
                    ));
        }
    }
}