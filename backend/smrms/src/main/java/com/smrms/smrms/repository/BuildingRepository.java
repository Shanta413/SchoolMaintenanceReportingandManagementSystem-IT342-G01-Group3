package com.smrms.smrms.repository;

import com.smrms.smrms.entity.Building;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface BuildingRepository extends JpaRepository<Building, String> {
    boolean existsByBuildingCode(String buildingCode);
    boolean existsByBuildingName(String buildingName);
    List<Building> findAllByBuildingIsActiveTrue();
    Optional<Building> findByBuildingName(String buildingName);
}
