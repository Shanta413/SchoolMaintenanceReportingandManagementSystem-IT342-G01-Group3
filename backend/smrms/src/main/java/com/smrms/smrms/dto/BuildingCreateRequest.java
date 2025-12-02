package com.smrms.smrms.dto;

import lombok.Data;

@Data
public class BuildingCreateRequest {
    private String buildingCode;
    private String buildingName;
    // image will be handled as MultipartFile in controller, not in this DTO
}
