package com.example.Rural.management.service;

import com.example.Rural.management.exception.ResourceNotFoundException;
import com.example.Rural.management.model.Crop;
import com.example.Rural.management.repository.CropRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CropService {

    private final CropRepository cropRepository;

    public CropService(CropRepository cropRepository) {
        this.cropRepository = cropRepository;
    }

    @Transactional(readOnly = true)
    public List<Crop> getAllCrops() {
        return cropRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Crop getCropById(Long id) {
        return cropRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Crop", "id", id));
    }

    @Transactional(readOnly = true)
    public List<Crop> getCropsBySeason(String season) {
        return cropRepository.findBySeasonIgnoreCase(season);
    }

    @Transactional(readOnly = true)
    public long getCropCount() {
        return cropRepository.count();
    }

    public Crop createCrop(Crop crop) {
        return cropRepository.save(crop);
    }

    public Crop updateCrop(Long id, Crop cropDetails) {
        Crop crop = getCropById(id);
        crop.setCropName(cropDetails.getCropName());
        crop.setSeason(cropDetails.getSeason());
        crop.setAreaHectares(cropDetails.getAreaHectares());
        crop.setExpectedYieldQuintals(cropDetails.getExpectedYieldQuintals());
        crop.setMspRatePerQuintal(cropDetails.getMspRatePerQuintal());
        crop.setWaterRequirement(cropDetails.getWaterRequirement());
        crop.setRecommendedFertilizer(cropDetails.getRecommendedFertilizer());
        crop.setPestAdvisory(cropDetails.getPestAdvisory());
        crop.setDescription(cropDetails.getDescription());
        crop.setHarvestMonth(cropDetails.getHarvestMonth());
        return cropRepository.save(crop);
    }

    public void deleteCrop(Long id) {
        Crop crop = getCropById(id);
        cropRepository.delete(crop);
    }
}
