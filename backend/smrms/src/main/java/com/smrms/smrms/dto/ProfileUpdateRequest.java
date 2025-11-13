package com.smrms.smrms.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String fullname;
    private String mobileNumber;
    private String password;
    private String avatarUrl;

    // 🟢 Add these for student info updates
    private String studentDepartment;
    private String studentIdNumber;
}
