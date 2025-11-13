package com.smrms.smrms.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String fullname;
    private String email;
    private String password;
    private String mobileNumber;
    private String studentIdNumber;
    private String studentDepartment;
}
