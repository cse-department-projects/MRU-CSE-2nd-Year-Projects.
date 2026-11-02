package com.athletehub.api.service;

import com.athletehub.api.entity.Athlete;
import com.athletehub.api.entity.Organization;
import com.athletehub.api.entity.RecruitmentProspect;
import com.athletehub.api.entity.User;
import com.athletehub.api.entity.enums.RecruitmentStage;
import com.athletehub.api.repository.AthleteRepository;
import com.athletehub.api.repository.OrganizationRepository;
import com.athletehub.api.repository.RecruitmentProspectRepository;
import com.athletehub.api.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.opencsv.CSVReader;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/** Imports existing Athlete records into an organization's recruitment pipeline. */
@Service
public class RecruitmentImportService {
    private final ObjectMapper objectMapper;
    private final AthleteRepository athleteRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final RecruitmentProspectRepository prospectRepository;

    public RecruitmentImportService(ObjectMapper objectMapper, AthleteRepository athleteRepository,
                                    UserRepository userRepository, OrganizationRepository organizationRepository,
                                    RecruitmentProspectRepository prospectRepository) {
        this.objectMapper = objectMapper;
        this.athleteRepository = athleteRepository;
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.prospectRepository = prospectRepository;
    }

    @Transactional
    public Map<String, Object> importFile(MultipartFile file, Integer recruiterId, Integer organizationId) throws Exception {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Choose a non-empty CSV, XLSX, or JSON file.");
        User recruiter = userRepository.findById(recruiterId).orElseThrow(() -> new IllegalArgumentException("Recruiter not found."));
        Organization organization = organizationRepository.findById(organizationId).orElseThrow(() -> new IllegalArgumentException("Organization not found."));
        List<Map<String, String>> rows = parse(file);
        int imported = 0, skipped = 0, failed = 0;
        List<String> errors = new ArrayList<>();

        for (int index = 0; index < rows.size(); index++) {
            try {
                Map<String, String> row = rows.get(index);
                Integer athleteId = integerValue(row, "athlete_id", "athleteid", "id");
                if (athleteId == null) throw new IllegalArgumentException("athlete_id is required");
                Athlete athlete = athleteRepository.findById(athleteId).orElseThrow(() -> new IllegalArgumentException("Athlete " + athleteId + " was not found"));
                if (prospectRepository.findByAthleteIdAndRecruiterId(athleteId, recruiterId).isPresent()) { skipped++; continue; }

                RecruitmentProspect prospect = new RecruitmentProspect();
                prospect.setAthlete(athlete);
                prospect.setRecruiter(recruiter);
                prospect.setOrganization(organization);
                prospect.setStage(stageValue(row));
                Integer rating = integerValue(row, "rating");
                if (rating != null) {
                    if (rating < 0 || rating > 100) throw new IllegalArgumentException("rating must be between 0 and 100");
                    prospect.setRating(rating);
                }
                prospectRepository.save(prospect);
                imported++;
            } catch (Exception exception) {
                failed++;
                errors.add("Row " + (index + 2) + ": " + exception.getMessage());
            }
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalRows", rows.size()); result.put("imported", imported); result.put("skipped", skipped); result.put("failed", failed); result.put("errors", errors);
        return result;
    }

    private List<Map<String, String>> parse(MultipartFile file) throws Exception {
        String name = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase(Locale.ROOT);
        if (name.endsWith(".csv")) return csv(file);
        if (name.endsWith(".json")) return json(file);
        if (name.endsWith(".xlsx")) return xlsx(file);
        throw new IllegalArgumentException("Supported formats: CSV, XLSX, JSON.");
    }

    private List<Map<String, String>> csv(MultipartFile file) throws Exception {
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            List<String[]> data = reader.readAll();
            if (data.isEmpty()) return List.of();
            List<Map<String, String>> rows = new ArrayList<>();
            for (int i = 1; i < data.size(); i++) rows.add(row(headers(data.get(0)), data.get(i)));
            return rows;
        }
    }

    private List<Map<String, String>> json(MultipartFile file) throws Exception {
        JsonNode root = objectMapper.readTree(file.getInputStream());
        if (!root.isArray()) throw new IllegalArgumentException("JSON must be an array of recruitment records.");
        List<Map<String, String>> rows = new ArrayList<>();
        for (JsonNode node : root) {
            Map<String, String> row = new LinkedHashMap<>();
            node.fields().forEachRemaining(field -> row.put(normalize(field.getKey()), field.getValue().asText()));
            rows.add(row);
        }
        return rows;
    }

    private List<Map<String, String>> xlsx(MultipartFile file) throws Exception {
        try (XSSFWorkbook book = new XSSFWorkbook(file.getInputStream())) {
            if (book.getNumberOfSheets() == 0) return List.of();
            var sheet = book.getSheetAt(0); var headerRow = sheet.getRow(sheet.getFirstRowNum());
            if (headerRow == null) return List.of();
            DataFormatter formatter = new DataFormatter(); List<String> headers = new ArrayList<>();
            for (var cell : headerRow) headers.add(normalize(formatter.formatCellValue(cell)));
            List<Map<String, String>> rows = new ArrayList<>();
            for (int rowIndex = headerRow.getRowNum() + 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                var sheetRow = sheet.getRow(rowIndex); if (sheetRow == null) continue;
                String[] values = new String[headers.size()];
                for (int column = 0; column < headers.size(); column++) values[column] = formatter.formatCellValue(sheetRow.getCell(column));
                rows.add(row(headers, values));
            }
            return rows;
        }
    }

    private List<String> headers(String[] input) { List<String> result = new ArrayList<>(); for (String value : input) result.add(normalize(value)); return result; }
    private Map<String, String> row(List<String> headers, String[] values) { Map<String, String> row = new LinkedHashMap<>(); for (int i = 0; i < headers.size(); i++) row.put(headers.get(i), i < values.length ? values[i].trim() : ""); return row; }
    private String normalize(String value) { return value == null ? "" : value.trim().toLowerCase(Locale.ROOT).replace(' ', '_'); }
    private Integer integerValue(Map<String, String> row, String... keys) { for (String key : keys) { String value = row.get(key); if (value != null && !value.isBlank()) return Integer.valueOf(value.trim()); } return null; }
    private RecruitmentStage stageValue(Map<String, String> row) { String value = row.get("stage"); return value == null || value.isBlank() ? RecruitmentStage.NEW_PROSPECT : RecruitmentStage.valueOf(value.trim().toUpperCase(Locale.ROOT).replace(' ', '_')); }
}
