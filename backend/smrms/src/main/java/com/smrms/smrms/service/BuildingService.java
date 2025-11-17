package com.smrms.smrms.service;

import com.smrms.smrms.dto.BuildingCreateRequest;
import com.smrms.smrms.dto.BuildingResponse;
import com.smrms.smrms.entity.Building;
import com.smrms.smrms.repository.BuildingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BuildingService {

    private final BuildingRepository buildingRepository;
    private final SupabaseStorageService supabaseStorageService;

    public BuildingResponse createBuilding(BuildingCreateRequest request, MultipartFile file) throws Exception {
        // Check for uniqueness
        if (buildingRepository.existsByBuildingCode(request.getBuildingCode())) {
            throw new RuntimeException("Building code already exists");
        }
        if (buildingRepository.existsByBuildingName(request.getBuildingName())) {
            throw new RuntimeException("Building name already exists");
        }

        String imageUrl = null;
        if (file != null && !file.isEmpty()) {
            imageUrl = supabaseStorageService.upload(file);
        }

        Building building = Building.builder()
                .buildingCode(request.getBuildingCode())
                .buildingName(request.getBuildingName())
                .buildingIsActive(true)
                .buildingImageUrl(imageUrl)
                .buildingCreatedAt(LocalDateTime.now())
                .buildingUpdatedAt(LocalDateTime.now())
                .build();

        building = buildingRepository.save(building);

        return BuildingResponse.builder()
                .id(building.getId())
                .buildingCode(building.getBuildingCode())
                .buildingName(building.getBuildingName())
                .buildingIsActive(building.isBuildingIsActive())
                .buildingImageUrl(building.getBuildingImageUrl())
                .build();
    }

    public List<BuildingResponse> getActiveBuildings() {
        return buildingRepository.findAllByBuildingIsActiveTrue().stream().map(
                b -> BuildingResponse.builder()
                        .id(b.getId())
                        .buildingCode(b.getBuildingCode())
                        .buildingName(b.getBuildingName())
                        .buildingIsActive(b.isBuildingIsActive())
                        .buildingImageUrl(b.getBuildingImageUrl())
                        .build()
        ).collect(Collectors.toList());
    }

    // Add update, deactivate, etc., as needed
}
