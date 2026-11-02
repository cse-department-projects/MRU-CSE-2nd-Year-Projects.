package com.athletehub.api.dataacquisition.engine;

import com.athletehub.api.dataacquisition.dto.TransformedRecord;
import com.athletehub.api.entity.Athlete;
import org.springframework.stereotype.Component;

@Component
public class ValidationEngine {

    public void validate(TransformedRecord record) {
        Athlete athlete = record.getAthlete();
        if (athlete == null) {
            record.addError("Athlete object is null");
            return;
        }

        if (athlete.getFirstName() == null || athlete.getFirstName().isBlank()) {
            record.addError("Missing first name");
        }
        if (athlete.getLastName() == null || athlete.getLastName().isBlank()) {
            record.addError("Missing last name");
        }
        if (athlete.getDateOfBirth() == null) {
            record.addError("Missing or invalid date of birth");
        }
        if (athlete.getCountry() == null || athlete.getCountry().isBlank()) {
            record.addError("Missing country");
        }
        if (athlete.getSport() == null || athlete.getSport().getName() == null || athlete.getSport().getName().isBlank()) {
            record.addError("Missing sport");
        }
        
        // Height and Weight were already checked for negatives during mapping and throw an exception,
        // but if they slipped through, we check them again.
        if (athlete.getHeight() != null && athlete.getHeight() < 0) {
            record.addError("Negative height");
        }
        if (athlete.getWeight() != null && athlete.getWeight() < 0) {
            record.addError("Negative weight");
        }
    }
}
