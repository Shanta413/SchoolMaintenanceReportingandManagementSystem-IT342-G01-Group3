package com.smrms.smrms.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentViewDTO {
    private String id;
    private String fullname;
    private String email;
    private String mobileNumber;
    private String studentDepartment;
    private String studentIdNumber;
    private String password;   // <-- This is #7
    private String avatarUrl;
    private String authMethod;
}
