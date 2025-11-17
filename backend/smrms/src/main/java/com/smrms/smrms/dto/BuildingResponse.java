package com.smrms.smrms.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BuildingResponse {
    private String id;
    private String buildingCode;
    private String buildingName;
    private boolean buildingIsActive;
    private String buildingImageUrl;
}
