package com.smrms.smrms.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceStaffViewDTO {
    private String id;
    private String userId;
    private String fullname;
    private String email;
    private String mobileNumber;
    private String staffId;
    private String authMethod;
    private LocalDateTime createdAt;  // ADD THIS LINE
}