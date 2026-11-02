package com.athletehub.api.dataacquisition.mapping;

import com.athletehub.api.dataacquisition.dto.RawRecord;
import com.athletehub.api.entity.Athlete;

public interface DatasetMappingProfile {
    String getProfileName();
    boolean supports(String datasetIdentifier);
    
    /**
     * Maps the raw record into the target entity schema.
     * Throw IllegalArgumentException if mapping fails due to format issues.
     */
    void mapToAthlete(RawRecord rawRecord, Athlete athlete) throws Exception;
}
