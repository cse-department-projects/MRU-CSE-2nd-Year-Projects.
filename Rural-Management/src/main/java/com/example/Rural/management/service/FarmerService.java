package com.example.Rural.management.service;

import com.example.Rural.management.exception.ResourceNotFoundException;
import com.example.Rural.management.model.Farmer;
import com.example.Rural.management.repository.FarmerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class FarmerService {

    private final FarmerRepository farmerRepository;

    public FarmerService(FarmerRepository farmerRepository) {
        this.farmerRepository = farmerRepository;
    }

    @Transactional(readOnly = true)
    public List<Farmer> getAllFarmers() {
        return farmerRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Farmer getFarmerById(Long id) {
        return farmerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer", "id", id));
    }

    @Transactional(readOnly = true)
    public List<Farmer> getFarmersByWard(String ward) {
        return farmerRepository.findByWardIgnoreCase(ward);
    }

    @Transactional(readOnly = true)
    public List<Farmer> getFarmersByCrop(String crop) {
        return farmerRepository.findByMainCropIgnoreCase(crop);
    }

    @Transactional(readOnly = true)
    public long getFarmerCount() {
        return farmerRepository.count();
    }

    public Farmer createFarmer(Farmer farmer) {
        return farmerRepository.save(farmer);
    }

    public Farmer updateFarmer(Long id, Farmer farmerDetails) {
        Farmer farmer = getFarmerById(id);
        farmer.setFullName(farmerDetails.getFullName());
        farmer.setLandSizeAcres(farmerDetails.getLandSizeAcres());
        farmer.setMainCrop(farmerDetails.getMainCrop());
        farmer.setWard(farmerDetails.getWard());
        farmer.setStatus(farmerDetails.getStatus());
        farmer.setContactPhone(farmerDetails.getContactPhone());
        farmer.setSoilType(farmerDetails.getSoilType());
        farmer.setIrrigationType(farmerDetails.getIrrigationType());
        farmer.setAnnualYieldQuintals(farmerDetails.getAnnualYieldQuintals());
        farmer.setAadhaarMasked(farmerDetails.getAadhaarMasked());
        farmer.setVillageArea(farmerDetails.getVillageArea());
        farmer.setActiveSchemes(farmerDetails.getActiveSchemes());
        return farmerRepository.save(farmer);
    }

    public void deleteFarmer(Long id) {
        Farmer farmer = getFarmerById(id);
        farmerRepository.delete(farmer);
    }
}
