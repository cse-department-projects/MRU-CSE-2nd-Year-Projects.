package com.smartvillage.repository;

import com.smartvillage.model.CropPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CropPriceRepository extends JpaRepository<CropPrice, Long> {
    List<CropPrice> findAllByOrderByCropNameAsc();
}
