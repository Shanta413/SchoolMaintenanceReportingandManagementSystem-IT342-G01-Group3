package com.smrms.smrms.controller;

import com.smrms.smrms.dto.BuildingCreateRequest;
import com.smrms.smrms.dto.BuildingResponse;
import com.smrms.smrms.service.BuildingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/buildings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // Adjust as needed for prod
public class BuildingController {

    private final BuildingService buildingService;

    // === Create building (Admin) ===
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createBuilding(
            @RequestPart("data") BuildingCreateRequest request,
            @RequestPart("file") MultipartFile file
    ) {
        try {
            BuildingResponse response = buildingService.createBuilding(request, file);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // === Get all active buildings ===
    @GetMapping
    public ResponseEntity<List<BuildingResponse>> getActiveBuildings() {
        return ResponseEntity.ok(buildingService.getActiveBuildings());
    }

    // === Get a building by buildingCode (e.g., /api/buildings/code/RTL) ===
    @GetMapping("/code/{buildingCode}")
    public ResponseEntity<BuildingResponse> getBuildingByCode(@PathVariable String buildingCode) {
        try {
            BuildingResponse response = buildingService.getBuildingByCode(buildingCode);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
