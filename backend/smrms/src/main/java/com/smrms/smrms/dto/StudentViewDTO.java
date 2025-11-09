package com.smrms.smrms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private String password; // ✅ Added for auto-create users
    private String avatarUrl; // ✅ Add this

}
