package com.athletehub.api.service;

import com.athletehub.api.entity.Organization;
import com.athletehub.api.repository.AthleteRepository;
import com.athletehub.api.repository.OrganizationRepository;
import com.athletehub.api.repository.OrganizationTypeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationTypeRepository organizationTypeRepository;
    private final AthleteRepository athleteRepository;

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[\\w\\.-]+@[\\w\\.-]+\\.\\w+$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\+?[\\d\\s\\-\\(\\)]{7,20}$");
    private static final Pattern WEBSITE_PATTERN = Pattern.compile("^(https?:\\/\\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w \\.-]*)*\\/?$");

    public OrganizationService(OrganizationRepository organizationRepository, OrganizationTypeRepository organizationTypeRepository, AthleteRepository athleteRepository) {
        this.organizationRepository = organizationRepository;
        this.organizationTypeRepository = organizationTypeRepository;
        this.athleteRepository = athleteRepository;
    }

    public synchronized String generateOrganizationCode() {
        Integer lastId = organizationRepository.findLastInsertedId();
        int nextNum = (lastId == null) ? 1 : lastId + 1;
        while (true) {
            String code = String.format("ORG%06d", nextNum);
            if (!organizationRepository.existsByOrganizationCode(code)) {
                return code;
            }
            nextNum++;
        }
    }

    public Map<String, Object> getOrganizationDetails(Organization org, long athleteCount) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", org.getId());
        map.put("organization_code", org.getOrganizationCode());
        map.put("name", org.getName());
        map.put("email", org.getEmail());
        map.put("phone", org.getPhone());
        map.put("website", org.getWebsite());
        map.put("description", org.getDescription());
        map.put("logo_url", org.getLogoUrl());

        Map<String, String> address = new HashMap<>();
        address.put("line", org.getAddressLine());
        address.put("city", org.getCity());
        address.put("state", org.getState());
        address.put("country", org.getCountry());
        address.put("postal_code", org.getPostalCode());
        map.put("address", address);

        if (org.getOrganizationType() != null) {
            Map<String, Object> orgType = new HashMap<>();
            orgType.put("id", org.getOrganizationType().getId());
            orgType.put("name", org.getOrganizationType().getName());
            map.put("organization_type", orgType);
        } else {
            map.put("organization_type", null);
        }

        map.put("status", org.getStatus());
        map.put("created_at", org.getCreatedAt() != null ? org.getCreatedAt().toString() : null);
        map.put("updated_at", org.getUpdatedAt() != null ? org.getUpdatedAt().toString() : null);
        map.put("athlete_count", athleteCount);

        return map;
    }

    public List<String> validateOrganizationData(Map<String, Object> data) {
        List<String> errors = new ArrayList<>();

        String[] required = {"name", "organization_type_id", "email", "phone", "address_line", "city", "state", "country", "postal_code"};
        for (String field : required) {
            if (data.get(field) == null || String.valueOf(data.get(field)).trim().isEmpty()) {
                errors.add("Missing required field: " + field);
            }
        }

        if (data.get("email") != null) {
            if (!EMAIL_PATTERN.matcher(String.valueOf(data.get("email"))).matches()) {
                errors.add("Invalid email format.");
            }
        }

        if (data.get("phone") != null) {
            if (!PHONE_PATTERN.matcher(String.valueOf(data.get("phone"))).matches()) {
                errors.add("Invalid phone number format.");
            }
        }

        if (data.get("website") != null && !String.valueOf(data.get("website")).trim().isEmpty()) {
            if (!WEBSITE_PATTERN.matcher(String.valueOf(data.get("website"))).matches()) {
                errors.add("Invalid website URL format.");
            }
        }

        if (data.get("organization_type_id") != null) {
            try {
                Integer typeId = Integer.valueOf(String.valueOf(data.get("organization_type_id")));
                if (!organizationTypeRepository.existsById(typeId)) {
                    errors.add("Selected organization type does not exist.");
                }
            } catch (NumberFormatException e) {
                errors.add("Selected organization type does not exist.");
            }
        }

        return errors;
    }

    @Transactional
    public Organization createOrganization(Integer userId, Map<String, Object> data) throws Exception {
        String name = (String) data.get("name");
        Organization existing = organizationRepository.findByName(name);
        if (existing != null) {
            if ("Deleted".equals(existing.getStatus())) {
                existing.setName(existing.getName() + "_DELETED_" + System.currentTimeMillis());
                organizationRepository.save(existing);
            } else {
                throw new Exception("Organization name already exists.");
            }
        }

        Organization org = new Organization();
        org.setOrganizationCode(generateOrganizationCode());
        org.setName(name);
        org.setEmail((String) data.get("email"));
        org.setPhone((String) data.get("phone"));
        org.setWebsite((String) data.get("website"));
        org.setDescription((String) data.get("description"));
        org.setAddressLine((String) data.get("address_line"));
        org.setCity((String) data.get("city"));
        org.setState((String) data.get("state"));
        org.setCountry((String) data.get("country"));
        org.setPostalCode((String) data.get("postal_code"));
        org.setStatus("Active");

        Integer typeId = Integer.valueOf(String.valueOf(data.get("organization_type_id")));
        org.setOrganizationType(organizationTypeRepository.findById(typeId).orElse(null));

        org.setCreatedBy(userId);
        org.setUpdatedBy(userId);

        return organizationRepository.save(org);
    }

    @Transactional
    public Organization updateOrganization(Organization org, Map<String, Object> data, Integer updaterId) throws Exception {
        if (data.containsKey("name")) {
            String newName = (String) data.get("name");
            if (!newName.equals(org.getName())) {
                if (organizationRepository.findByName(newName) != null) {
                    throw new Exception("Organization name already exists.");
                }
            }
            org.setName(newName);
        }

        if (data.containsKey("email")) org.setEmail((String) data.get("email"));
        if (data.containsKey("phone")) org.setPhone((String) data.get("phone"));
        if (data.containsKey("website")) org.setWebsite((String) data.get("website"));
        if (data.containsKey("description")) org.setDescription((String) data.get("description"));
        if (data.containsKey("address_line")) org.setAddressLine((String) data.get("address_line"));
        if (data.containsKey("city")) org.setCity((String) data.get("city"));
        if (data.containsKey("state")) org.setState((String) data.get("state"));
        if (data.containsKey("country")) org.setCountry((String) data.get("country"));
        if (data.containsKey("postal_code")) org.setPostalCode((String) data.get("postal_code"));

        if (data.containsKey("organization_type_id") && data.get("organization_type_id") != null) {
            Integer typeId = Integer.valueOf(String.valueOf(data.get("organization_type_id")));
            org.setOrganizationType(organizationTypeRepository.findById(typeId).orElse(null));
        }

        org.setUpdatedBy(updaterId);
        return organizationRepository.save(org);
    }

    public Map<String, Object> listOrganizations(String search, Integer typeId, String status, String city, String state, int page, int pageSize, String sortBy, String sortDir) {
        Specification<Organization> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(cb.notEqual(root.get("status"), "Deleted"));

            if (status != null && !status.isEmpty()) predicates.add(cb.equal(root.get("status"), status));
            if (typeId != null) predicates.add(cb.equal(root.get("organizationType").get("id"), typeId));
            if (city != null && !city.isEmpty()) predicates.add(cb.like(cb.lower(root.get("city")), "%" + city.toLowerCase() + "%"));
            if (state != null && !state.isEmpty()) predicates.add(cb.like(cb.lower(root.get("state")), "%" + state.toLowerCase() + "%"));

            if (search != null && !search.isEmpty()) {
                String likeSearch = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("name")), likeSearch),
                    cb.like(cb.lower(root.get("organizationCode")), likeSearch),
                    cb.like(cb.lower(root.get("email")), likeSearch),
                    cb.like(cb.lower(root.get("phone")), likeSearch)
                ));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);

        Page<Organization> paginated = organizationRepository.findAll(spec, pageable);

        // N+1 Prevention: Batch fetch athlete counts for all paginated organizations using a single database query
        List<Integer> orgIds = paginated.getContent().stream().map(Organization::getId).collect(Collectors.toList());
        Map<Integer, Long> athleteCounts = new HashMap<>();
        
        if (!orgIds.isEmpty()) {
            List<Object[]> countResults = athleteRepository.countActiveAthletesByOrganizationIds(orgIds);
            for (Object[] row : countResults) {
                athleteCounts.put((Integer) row[0], (Long) row[1]);
            }
        }

        List<Map<String, Object>> items = paginated.getContent().stream().map(o -> {
            long count = athleteCounts.getOrDefault(o.getId(), 0L);
            return getOrganizationDetails(o, count);
        }).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("items", items);
        result.put("total_records", paginated.getTotalElements());
        result.put("total_pages", paginated.getTotalPages());
        result.put("page", page);
        result.put("page_size", pageSize);

        return result;
    }
}
