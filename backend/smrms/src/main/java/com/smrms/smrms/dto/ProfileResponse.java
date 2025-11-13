package com.smrms.smrms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProfileResponse {
    private String fullname;
    private String email;
    private String mobileNumber;
    private boolean isActive;
    private LocalDateTime createdAt;
    private String avatarUrl;
    private String authMethod;
    private String studentDepartment;
    private String studentIdNumber;
}