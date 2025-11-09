package com.smrms.smrms.dto;

import lombok.Data;

@Data
public class MaintenanceStaffUpsertRequest {
    private String fullname;
    private String email;
    private String mobileNumber;
    private String password;   // optional on update
    private String staffId;
}
