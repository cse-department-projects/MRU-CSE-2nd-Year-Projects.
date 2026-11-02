package com.athletehub.api.repository;

import com.athletehub.api.entity.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CountryRepository extends JpaRepository<Country, Integer> {
    Optional<Country> findByNameIgnoreCase(String name);
    Optional<Country> findByCodeIgnoreCase(String code);
}
