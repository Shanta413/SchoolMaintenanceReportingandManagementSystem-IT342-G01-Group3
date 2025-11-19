package com.smrms.smrms.repository;

import com.smrms.smrms.entity.Building;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BuildingRepository extends JpaRepository<Building, String> {

    // Check uniqueness
    boolean existsByBuildingCode(String buildingCode);
    boolean existsByBuildingName(String buildingName);

    // Fetch only active buildings
    List<Building> findAllByBuildingIsActiveTrue();

    // Fetch by buildingCode (for frontend route /buildings/{buildingCode})
    Optional<Building> findByBuildingCode(String buildingCode);
}
