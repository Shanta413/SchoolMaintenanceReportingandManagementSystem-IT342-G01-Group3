package com.smrms.smrms.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MaintenanceStaffViewDTO {
    private String id;
    private String fullname;
    private String email;
    private String mobileNumber;
    private String staffId;
}
