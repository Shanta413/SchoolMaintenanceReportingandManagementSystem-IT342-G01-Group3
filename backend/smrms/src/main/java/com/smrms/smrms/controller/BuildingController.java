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

    @GetMapping("/active")
    public List<BuildingResponse> getActiveBuildings() {
        return buildingService.getActiveBuildings();
    }

    @GetMapping("/code/{buildingCode}")
    public BuildingResponse getBuildingByCode(@PathVariable String buildingCode) {
        return buildingService.getBuildingByCode(buildingCode);
    }

    // 🟩 This is the endpoint your frontend is calling for all buildings!
    @GetMapping
    public List<BuildingSummaryDTO> getAllBuildingsWithIssueCount() {
        return buildingService.getAllBuildingsWithIssueCount();
    }
}
