package com.smrms.smrms.controller;

import com.smrms.smrms.dto.BuildingCreateRequest;
import com.smrms.smrms.dto.BuildingResponse;
import com.smrms.smrms.dto.BuildingSummaryDTO;
import com.smrms.smrms.service.BuildingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/buildings")
@RequiredArgsConstructor
public class BuildingController {

    private final BuildingService buildingService;

    @PostMapping
    public BuildingResponse createBuilding(
            @RequestParam("buildingCode") String buildingCode,
            @RequestParam("buildingName") String buildingName,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) throws Exception {
        BuildingCreateRequest request = new BuildingCreateRequest();
        request.setBuildingCode(buildingCode);
        request.setBuildingName(buildingName);
        return buildingService.createBuilding(request, file);
    }

    // 🟩 NEW: Update building
    @PutMapping("/{id}")
    public BuildingResponse updateBuilding(
            @PathVariable String id,
            @RequestParam("buildingCode") String buildingCode,
            @RequestParam("buildingName") String buildingName,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) throws Exception {

        System.out.println("===== BUILDING UPDATE REQUEST =====");
        System.out.println("ID: " + id);
        System.out.println("buildingCode: " + buildingCode);
        System.out.println("buildingName: " + buildingName);
        if (file != null) {
            System.out.println("File received: " + file.getOriginalFilename());
        } else {
            System.out.println("No file uploaded.");
        }
        System.out.println("===================================");

        BuildingCreateRequest req = new BuildingCreateRequest();
        req.setBuildingCode(buildingCode);
        req.setBuildingName(buildingName);

        return buildingService.updateBuilding(id, req, file);
    }

    // 🟩 NEW: Delete building
    @DeleteMapping("/{id}")
    public void deleteBuilding(@PathVariable String id) {
        System.out.println("===== DELETE BUILDING =====");
        System.out.println("Deleting ID: " + id);
        System.out.println("===========================");
        buildingService.deleteBuilding(id);
    }

    @GetMapping("/active")
    public List<BuildingResponse> getActiveBuildings() {
        return buildingService.getActiveBuildings();
    }

    @GetMapping("/code/{buildingCode}")
    public BuildingResponse getBuildingByCode(@PathVariable String buildingCode) {
        return buildingService.getBuildingByCode(buildingCode);
    }

    @GetMapping
    public List<BuildingSummaryDTO> getAllBuildingsWithIssueCount() {
        return buildingService.getAllBuildingsWithIssueCount();
    }
}
