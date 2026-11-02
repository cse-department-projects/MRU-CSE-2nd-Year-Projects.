package com.athletehub.api.dataacquisition.service;

import com.athletehub.api.dataacquisition.dto.ImportPreviewResponse;
import com.athletehub.api.dataacquisition.dto.RawRecord;
import com.athletehub.api.dataacquisition.dto.TransformedRecord;
import com.athletehub.api.dataacquisition.engine.TransformationEngine;
import com.athletehub.api.dataacquisition.engine.ValidationEngine;
import com.athletehub.api.dataacquisition.mapping.DatasetMappingProfile;
import com.athletehub.api.dataacquisition.parser.DatasetParser;
import com.athletehub.api.entity.Athlete;
import com.athletehub.api.entity.ImportJob;
import com.athletehub.api.repository.AthleteRepository;
import com.athletehub.api.repository.ImportJobRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

@Service
public class DatasetImportService {

    private final List<DatasetMappingProfile> mappingProfiles;
    private final TransformationEngine transformationEngine;
    private final ValidationEngine validationEngine;
    private final AthleteRepository athleteRepository;
    private final ImportJobRepository importJobRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public DatasetImportService(List<DatasetMappingProfile> mappingProfiles,
                                TransformationEngine transformationEngine,
                                ValidationEngine validationEngine,
                                AthleteRepository athleteRepository,
                                ImportJobRepository importJobRepository) {
        this.mappingProfiles = mappingProfiles;
        this.transformationEngine = transformationEngine;
        this.validationEngine = validationEngine;
        this.athleteRepository = athleteRepository;
        this.importJobRepository = importJobRepository;
    }

    public ImportPreviewResponse previewImport(DatasetParser parser, String datasetIdentifier, int previewLimit) throws Exception {
        DatasetMappingProfile profile = getMappingProfile(datasetIdentifier);

        ImportPreviewResponse response = new ImportPreviewResponse();
        response.setDatasetName(profile.getProfileName());
        
        List<TransformedRecord> previewRecords = new ArrayList<>();
        int total = 0, valid = 0, invalid = 0, duplicate = 0;

        transformationEngine.clearCache();

        for (RawRecord rawRecord : (Iterable<RawRecord>) () -> parser.iterator()) {
            total++;
            TransformedRecord tr = processRecord(rawRecord, profile);

            if (tr.isValid() && !tr.isDuplicate()) {
                valid++;
            } else if (tr.isDuplicate()) {
                duplicate++;
            } else {
                invalid++;
            }

            if (previewRecords.size() < previewLimit) {
                previewRecords.add(tr);
            }
        }

        response.setTotalRows(total);
        response.setValidRows(valid);
        response.setInvalidRows(invalid);
        response.setDuplicateRows(duplicate);
        response.setPreviewRecords(previewRecords);

        return response;
    }

    @Transactional
    public ImportJob executeImport(DatasetParser parser, String datasetIdentifier, String fileName) throws Exception {
        return executeImport(parser, datasetIdentifier, fileName, null);
    }

    @Transactional
    public ImportJob executeImport(DatasetParser parser, String datasetIdentifier, String fileName, Integer targetOrganizationId) throws Exception {
        DatasetMappingProfile profile = getMappingProfile(datasetIdentifier);
        
        ImportJob job = new ImportJob();
        job.setDatasetName(profile.getProfileName());
        job.setSource(datasetIdentifier);
        job.setFileName(fileName);
        job.setStartedAt(LocalDateTime.now());
        job.setStatus("RUNNING");
        job = importJobRepository.save(job);

        long startTime = System.currentTimeMillis();
        int total = 0, imported = 0, duplicate = 0, failed = 0;
        
        List<Athlete> batch = new ArrayList<>();
        int batchSize = 1000;

        transformationEngine.clearCache();

        for (RawRecord rawRecord : (Iterable<RawRecord>) () -> parser.iterator()) {
            total++;
            TransformedRecord tr = processRecord(rawRecord, profile);

            if (tr.isValid() && !tr.isDuplicate()) {
                Athlete athlete = tr.getAthlete();
                athlete.setImportJobId(job.getId());
                athlete.setRawSourceData(rawRecord.getRawLine()); // Storing raw JSON or line
                if (targetOrganizationId != null) {
                    athlete.setOrganizationId(targetOrganizationId);
                }
                
                // We leave userId as null for imported athletes since they don't have login accounts yet.

                batch.add(athlete);
                imported++;

                if (batch.size() >= batchSize) {
                    athleteRepository.saveAll(batch);
                    batch.clear();
                    entityManager.flush();
                    entityManager.clear();
                }
                
            } else if (tr.isDuplicate()) {
                duplicate++;
            } else {
                failed++;
            }
        }

        if (!batch.isEmpty()) {
            athleteRepository.saveAll(batch);
        }

        job.setTotalRows(total);
        job.setImportedRows(imported);
        job.setDuplicateRows(duplicate);
        job.setFailedRows(failed);
        job.setSkippedRows(duplicate + failed);
        job.setCompletedAt(LocalDateTime.now());
        job.setStatus("COMPLETED");
        job.setProcessingTimeMs(System.currentTimeMillis() - startTime);
        
        return importJobRepository.save(job);
    }

    @Transactional
    public int allocateAthletesToOrganization(Integer targetOrgId, Integer count, List<Integer> specificAthleteIds, Integer sportId, String country, String gender) {
        if (targetOrgId == null) {
            throw new IllegalArgumentException("Target organization is required.");
        }
        if (specificAthleteIds != null && !specificAthleteIds.isEmpty()) {
            return athleteRepository.assignAthletesToOrganization(specificAthleteIds, targetOrgId);
        }

        int limit = (count != null && count > 0) ? count : 10000;

        boolean hasSport = sportId != null;
        boolean hasCountry = country != null && !country.trim().isEmpty() && !"ALL".equalsIgnoreCase(country.trim());
        boolean hasGender = gender != null && !gender.trim().isEmpty() && !"ALL".equalsIgnoreCase(gender.trim());

        if (hasSport || hasCountry || hasGender) {
            String c = hasCountry ? country.trim() : null;
            String g = hasGender ? gender.trim() : null;
            List<Integer> matchingIds = athleteRepository.findUnassignedAthleteIdsByCriteria(sportId, c, g, limit);
            if (matchingIds.isEmpty()) {
                return 0;
            }
            return athleteRepository.assignAthletesToOrganization(matchingIds, targetOrgId);
        }

        List<Integer> unassignedIds = athleteRepository.findUnassignedAthleteIds(limit);
        if (unassignedIds.isEmpty()) {
            return 0;
        }
        return athleteRepository.assignAthletesToOrganization(unassignedIds, targetOrgId);
    }

    @Transactional
    public int allocateAthletesToOrganization(Integer targetOrgId, int count, List<Integer> specificAthleteIds) {
        return allocateAthletesToOrganization(targetOrgId, count, specificAthleteIds, null, null, null);
    }

    public Map<String, Object> getPoolFilterOptions() {
        List<Object[]> sportRows = athleteRepository.findUnassignedSportsWithCounts();
        List<Map<String, Object>> sports = new ArrayList<>();
        for (Object[] r : sportRows) {
            Map<String, Object> s = new HashMap<>();
            s.put("id", r[0]);
            s.put("name", r[1]);
            s.put("count", r[2]);
            sports.add(s);
        }

        List<Object[]> countryRows = athleteRepository.findUnassignedCountriesWithCounts();
        List<Map<String, Object>> countries = new ArrayList<>();
        for (Object[] r : countryRows) {
            Map<String, Object> c = new HashMap<>();
            c.put("name", r[0]);
            c.put("count", r[1]);
            countries.add(c);
        }

        List<Object[]> genderRows = athleteRepository.findUnassignedGendersWithCounts();
        List<Map<String, Object>> genders = new ArrayList<>();
        for (Object[] r : genderRows) {
            Map<String, Object> g = new HashMap<>();
            g.put("name", r[0]);
            g.put("count", r[1]);
            genders.add(g);
        }

        long totalUnassigned = athleteRepository.countByStatusNotAndOrganizationIdIsNull("Deleted");

        Map<String, Object> res = new HashMap<>();
        res.put("totalUnassigned", totalUnassigned);
        res.put("sports", sports);
        res.put("countries", countries);
        res.put("genders", genders);
        return res;
    }

    public Map<String, Object> getUnassignedAthletes(String search, Integer sportId, String country, String gender, int page, int pageSize) {
        Specification<Athlete> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("organizationId")));
            predicates.add(cb.notEqual(root.get("status"), "Deleted"));

            if (sportId != null) {
                predicates.add(cb.equal(root.get("sport").get("id"), sportId));
            }
            if (country != null && !country.trim().isEmpty() && !"ALL".equalsIgnoreCase(country.trim())) {
                predicates.add(cb.equal(cb.lower(root.get("country")), country.trim().toLowerCase()));
            }
            if (gender != null && !gender.trim().isEmpty() && !"ALL".equalsIgnoreCase(gender.trim())) {
                predicates.add(cb.equal(cb.upper(root.get("gender")), gender.trim().toUpperCase()));
            }
            if (search != null && !search.trim().isEmpty()) {
                String q = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("firstName")), q),
                    cb.like(cb.lower(root.get("lastName")), q),
                    cb.like(cb.lower(root.get("athleteCode")), q),
                    cb.like(cb.lower(root.get("city")), q)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Pageable pageable = PageRequest.of(Math.max(0, page - 1), pageSize, Sort.by(Sort.Direction.ASC, "lastName", "firstName"));
        Page<Athlete> pageResult = athleteRepository.findAll(spec, pageable);

        List<Map<String, Object>> items = new ArrayList<>();
        LocalDate now = LocalDate.now();
        for (Athlete a : pageResult.getContent()) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", a.getId());
            item.put("athleteCode", a.getAthleteCode());
            item.put("firstName", a.getFirstName());
            item.put("lastName", a.getLastName());
            item.put("fullName", a.getFirstName() + " " + a.getLastName());
            item.put("dateOfBirth", a.getDateOfBirth());
            if (a.getDateOfBirth() != null) {
                item.put("age", Period.between(a.getDateOfBirth(), now).getYears());
            } else {
                item.put("age", null);
            }
            item.put("gender", a.getGender());
            item.put("country", a.getCountry());
            item.put("city", a.getCity());
            if (a.getSport() != null) {
                item.put("sportId", a.getSport().getId());
                item.put("sportName", a.getSport().getName());
            } else {
                item.put("sportId", null);
                item.put("sportName", "N/A");
            }
            items.add(item);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("items", items);
        result.put("totalRecords", pageResult.getTotalElements());
        result.put("totalPages", pageResult.getTotalPages());
        result.put("page", page);
        result.put("pageSize", pageSize);
        return result;
    }

    private TransformedRecord processRecord(RawRecord rawRecord, DatasetMappingProfile profile) {
        TransformedRecord tr = new TransformedRecord(rawRecord);
        Athlete athlete = new Athlete();
        
        try {
            profile.mapToAthlete(rawRecord, athlete);
            tr.setAthlete(athlete);
            
            validationEngine.validate(tr);
            if (tr.isValid()) {
                transformationEngine.enrich(tr);
                
                // Duplicate Check logic: simple check on firstName, lastName, DOB, countryId
                if (isDuplicate(athlete)) {
                    tr.setDuplicate(true);
                    tr.addError("Duplicate athlete found");
                }
            }
        } catch (Exception e) {
            tr.addError("Mapping failed: " + e.getMessage());
        }

        return tr;
    }

    private boolean isDuplicate(Athlete newAthlete) {
        return newAthlete.getFirstName() != null
                && newAthlete.getLastName() != null
                && newAthlete.getDateOfBirth() != null
                && newAthlete.getCountry() != null
                && athleteRepository.existsByFirstNameIgnoreCaseAndLastNameIgnoreCaseAndDateOfBirthAndCountryIgnoreCase(
                        newAthlete.getFirstName(), newAthlete.getLastName(),
                        newAthlete.getDateOfBirth(), newAthlete.getCountry());
    }

    private DatasetMappingProfile getMappingProfile(String datasetIdentifier) {
        return mappingProfiles.stream()
                .filter(p -> p.supports(datasetIdentifier))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No mapping profile found for: " + datasetIdentifier));
    }

    public List<ImportJob> getImportHistory() {
        return importJobRepository.findAllByOrderByStartedAtDesc();
    }
}
