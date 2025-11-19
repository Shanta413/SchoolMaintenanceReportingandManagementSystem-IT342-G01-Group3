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

    /**
     * Create new building
     */
    public BuildingResponse createBuilding(BuildingCreateRequest request, MultipartFile file) throws Exception {

        // uniqueness checks
        if (buildingRepository.existsByBuildingCode(request.getBuildingCode())) {
            throw new RuntimeException("Building code already exists");
        }
        if (buildingRepository.existsByBuildingName(request.getBuildingName())) {
            throw new RuntimeException("Building name already exists");
        }

        // Upload image to Supabase if provided
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

        return toResponse(building);
    }

    /**
     * Get all active buildings
     */
    public List<BuildingResponse> getActiveBuildings() {
        return buildingRepository.findAllByBuildingIsActiveTrue()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * NEW — get building by code ("RTL", "SAL", etc.)
     */
    public BuildingResponse getBuildingByCode(String buildingCode) {
        Building building = buildingRepository.findByBuildingCode(buildingCode)
                .orElseThrow(() -> new RuntimeException("Building not found: " + buildingCode));

        return toResponse(building);
    }

    /**
     * Convert Entity → Response DTO
     */
    private BuildingResponse toResponse(Building b) {
        return BuildingResponse.builder()
                .id(b.getId())
                .buildingCode(b.getBuildingCode())
                .buildingName(b.getBuildingName())
                .buildingIsActive(b.isBuildingIsActive())
                .buildingImageUrl(b.getBuildingImageUrl())
                .build();
    }
}
