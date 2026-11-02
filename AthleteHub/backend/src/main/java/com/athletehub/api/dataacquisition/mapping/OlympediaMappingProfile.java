package com.athletehub.api.dataacquisition.mapping;

import com.athletehub.api.dataacquisition.dto.RawRecord;
import com.athletehub.api.entity.Athlete;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Map;
import java.util.UUID;

@Component
public class OlympediaMappingProfile implements DatasetMappingProfile {

    private static final String PROFILE_NAME = "Olympedia";

    @Override
    public String getProfileName() {
        return PROFILE_NAME;
    }

    @Override
    public boolean supports(String datasetIdentifier) {
        return PROFILE_NAME.equalsIgnoreCase(datasetIdentifier);
    }

    @Override
    public void mapToAthlete(RawRecord rawRecord, Athlete athlete) throws Exception {
        Map<String, String> data = rawRecord.getData();

        // 1. Full name: split by • or space
        String fullName = data.get("Full name");
        if (fullName == null || fullName.isBlank()) {
            throw new IllegalArgumentException("Missing name");
        }
        
        if (fullName.contains("•")) {
            String[] parts = fullName.split("•", 2);
            athlete.setFirstName(parts[0].trim());
            athlete.setLastName(parts[1].trim());
        } else {
            int spaceIdx = fullName.indexOf(' ');
            if (spaceIdx > 0) {
                athlete.setFirstName(fullName.substring(0, spaceIdx).trim());
                athlete.setLastName(fullName.substring(spaceIdx + 1).trim());
            } else {
                athlete.setFirstName(fullName.trim());
                athlete.setLastName(fullName.trim());
            }
        }

        // 2. Gender
        String sex = data.get("Sex");
        if ("Male".equalsIgnoreCase(sex)) {
            athlete.setGender("MALE");
        } else if ("Female".equalsIgnoreCase(sex)) {
            athlete.setGender("FEMALE");
        } else {
            athlete.setGender("UNKNOWN");
        }

        // 3. Date of Birth
        String born = data.get("Born");
        if (born != null && !born.isBlank()) {
            athlete.setDateOfBirth(parseDate(born));
        }

        // 4. Country NOC
        // Note: The actual ID mapping is done by the TransformationEngine via caching, 
        // this profile just sets the string name/NOC so the engine can look it up.
        String noc = data.get("NOC");
        if (noc == null || noc.isBlank()) {
            throw new IllegalArgumentException("Missing country");
        }
        athlete.setCountry(noc.trim());

        // 5. Sport
        String sportStr = data.get("Sport");
        if (sportStr == null || sportStr.isBlank()) {
            throw new IllegalArgumentException("Missing sport");
        }
        com.athletehub.api.entity.Sport sport = new com.athletehub.api.entity.Sport();
        // Example: "BK - Basketball" -> "Basketball"
        if (sportStr.contains("-")) {
            String[] parts = sportStr.split("-", 2);
            sport.setName(parts[1].trim());
        } else {
            sport.setName(sportStr.trim());
        }
        athlete.setSport(sport);

        // 6. Height and Weight
        String heightStr = data.get("Height (cm)");
        if (heightStr != null && !heightStr.isBlank()) {
            try {
                double h = Double.parseDouble(heightStr);
                if (h < 0) throw new IllegalArgumentException("Negative height");
                athlete.setHeight(h);
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Invalid height");
            }
        }

        String weightStr = data.get("Weight (kg)");
        if (weightStr != null && !weightStr.isBlank()) {
            try {
                double w = Double.parseDouble(weightStr);
                if (w < 0) throw new IllegalArgumentException("Negative weight");
                athlete.setWeight(w);
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Invalid weight");
            }
        }

        // 7. Role
        String role = data.get("Roles");
        if (role != null && !role.isBlank()) {
            athlete.setCompetitionRole(role.trim());
        }

        // 8. Auto-populate
        athlete.setSource("OLYMPIEDIA");
        athlete.setVerified(true);
        athlete.setSourceUrl(data.get("URL"));
        athlete.setAthleteCode("ATH-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase());
    }

    private LocalDate parseDate(String dateStr) {
        String[] patterns = {
            "M/d/yyyy", "MM/dd/yyyy", "MM-dd-yyyy", "M-d-yyyy", "yyyy-MM-dd"
        };
        for (String pattern : patterns) {
            try {
                return LocalDate.parse(dateStr.trim(), DateTimeFormatter.ofPattern(pattern));
            } catch (DateTimeParseException ignored) {}
        }
        throw new IllegalArgumentException("Invalid DOB format: " + dateStr);
    }
}
