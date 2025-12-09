package com.smrms.smrms.dto;

import lombok.*;
import java.time.LocalDateTime;

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
    private String password;
    private String avatarUrl;
    private String authMethod;
    private LocalDateTime createdAt;  // ADD THIS LINE
}