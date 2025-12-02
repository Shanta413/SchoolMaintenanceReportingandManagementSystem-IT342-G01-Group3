package com.smrms.smrms.service;

import com.smrms.smrms.dto.BuildingCreateRequest;
import com.smrms.smrms.dto.BuildingResponse;
import com.smrms.smrms.dto.BuildingSummaryDTO;
import com.smrms.smrms.dto.IssueCountDTO;
import com.smrms.smrms.entity.Building;
import com.smrms.smrms.entity.IssuePriority;
import com.smrms.smrms.repository.BuildingRepository;
import com.smrms.smrms.repository.IssueRepository;
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
    private final IssueRepository issueRepository;
    private final SupabaseStorageService supabaseStorageService;

    /**
     * CREATE BUILDING
     */
    public BuildingResponse createBuilding(BuildingCreateRequest request, MultipartFile file) throws Exception {

        System.out.println("===== SERVICE: createBuilding =====");
        System.out.println("Code: " + request.getBuildingCode());
        System.out.println("Name: " + request.getBuildingName());
        System.out.println("File: " + (file != null ? file.getOriginalFilename() : "NULL"));
        System.out.println("===================================");

        if (buildingRepository.existsByBuildingCode(request.getBuildingCode())) {
            throw new RuntimeException("Building code already exists");
        }
        if (buildingRepository.existsByBuildingName(request.getBuildingName())) {
            throw new RuntimeException("Building name already exists");
        }

        String imageUrl = null;
        if (file != null && !file.isEmpty()) {
            // IMPORTANT: building images = IMAGE upload
            imageUrl = supabaseStorageService.upload(file, "image");
        }

        LocalDateTime now = LocalDateTime.now();

        Building building = Building.builder()
                .buildingCode(request.getBuildingCode())
                .buildingName(request.getBuildingName())
                .buildingIsActive(true)
                .buildingImageUrl(imageUrl)
                .buildingCreatedAt(now)
                .buildingUpdatedAt(now)
                .build();

        building = buildingRepository.save(building);
        return toResponse(building);
    }

    /**
     * UPDATE BUILDING
     */
    public BuildingResponse updateBuilding(String id, BuildingCreateRequest request, MultipartFile file) throws Exception {

        System.out.println("===== SERVICE: updateBuilding =====");
        System.out.println("ID: " + id);
        System.out.println("New Code: " + request.getBuildingCode());
        System.out.println("New Name: " + request.getBuildingName());
        System.out.println("File: " + (file != null ? file.getOriginalFilename() : "NULL"));
        System.out.println("===================================");

        Building building = buildingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Building not found: " + id));

        building.setBuildingCode(request.getBuildingCode());
        building.setBuildingName(request.getBuildingName());

        if (file != null && !file.isEmpty()) {
            // IMPORTANT: update building image = IMAGE upload
            String newImageUrl = supabaseStorageService.upload(file, "image");
            building.setBuildingImageUrl(newImageUrl);
        }

        building.setBuildingUpdatedAt(LocalDateTime.now());
        building = buildingRepository.save(building);

        return toResponse(building);
    }

    /**
     * DELETE BUILDING
     */
    public void deleteBuilding(String id) {
        System.out.println("SERVICE DELETE BUILDING ID: " + id);
        buildingRepository.deleteById(id);
    }

    /**
     * GET ACTIVE BUILDINGS
     */
    public List<BuildingResponse> getActiveBuildings() {
        return buildingRepository.findAllByBuildingIsActiveTrue()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * GET BUILDING BY CODE
     */
    public BuildingResponse getBuildingByCode(String buildingCode) {
        Building building = buildingRepository.findByBuildingCode(buildingCode)
                .orElseThrow(() -> new RuntimeException("Building not found: " + buildingCode));

        return toResponse(building);
    }

    /**
     * GET ALL BUILDINGS + ISSUE COUNTS
     */
    public List<BuildingSummaryDTO> getAllBuildingsWithIssueCount() {
        List<Building> buildings = buildingRepository.findAll();

        return buildings.stream().map(b -> {
            long high = issueRepository.countByBuildingAndIssuePriority(b, IssuePriority.HIGH);
            long medium = issueRepository.countByBuildingAndIssuePriority(b, IssuePriority.MEDIUM);
            long low = issueRepository.countByBuildingAndIssuePriority(b, IssuePriority.LOW);

            IssueCountDTO count = IssueCountDTO.builder()
                    .high(high)
                    .medium(medium)
                    .low(low)
                    .build();

            return BuildingSummaryDTO.builder()
                    .id(b.getId())
                    .buildingCode(b.getBuildingCode())
                    .buildingName(b.getBuildingName())
                    .buildingIsActive(b.isBuildingIsActive())
                    .buildingImageUrl(b.getBuildingImageUrl())
                    .issueCount(count)
                    .build();
        }).collect(Collectors.toList());
    }

    /**
     * Convert Entity → DTO
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
