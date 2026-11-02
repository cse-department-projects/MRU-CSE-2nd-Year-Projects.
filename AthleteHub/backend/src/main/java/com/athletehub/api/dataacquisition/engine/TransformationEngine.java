package com.athletehub.api.dataacquisition.engine;

import com.athletehub.api.dataacquisition.dto.TransformedRecord;
import com.athletehub.api.entity.Country;
import com.athletehub.api.entity.Sport;
import com.athletehub.api.repository.CountryRepository;
import com.athletehub.api.repository.SportRepository;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;

@Component
public class TransformationEngine {

    private final CountryRepository countryRepository;
    private final SportRepository sportRepository;

    private final Map<String, Integer> countryCache = new HashMap<>();
    private final Map<String, Sport> sportCache = new HashMap<>();

    public TransformationEngine(CountryRepository countryRepository, SportRepository sportRepository) {
        this.countryRepository = countryRepository;
        this.sportRepository = sportRepository;
    }

    public void clearCache() {
        countryCache.clear();
        sportCache.clear();
    }

    public void enrich(TransformedRecord record) {
        if (!record.isValid()) return;

        try {
            // 1. Resolve Country
            String countryName = record.getAthlete().getCountry();
            if (countryName != null) {
                Integer countryId = countryCache.computeIfAbsent(countryName.toLowerCase(), k -> {
                    return countryRepository.findByNameIgnoreCase(countryName)
                            .map(Country::getId)
                            .orElseGet(() -> {
                                Country newCountry = new Country(countryName, null);
                                return countryRepository.save(newCountry).getId();
                            });
                });
                record.getAthlete().setCountryId(countryId);
            }

            // 2. Resolve Sport
            Sport tempSport = record.getAthlete().getSport();
            if (tempSport != null && tempSport.getName() != null) {
                String sportName = tempSport.getName();
                Sport resolvedSport = sportCache.computeIfAbsent(sportName.toLowerCase(), k -> {
                    return sportRepository.findByNameIgnoreCase(sportName)
                            .orElseGet(() -> {
                                Sport newSport = new Sport();
                                newSport.setName(sportName);
                                newSport.setCategory("Imported");
                                return sportRepository.save(newSport);
                            });
                });
                record.getAthlete().setSport(resolvedSport);
            }
        } catch (Exception e) {
            record.addError("Enrichment failed: " + e.getMessage());
        }
    }
}
