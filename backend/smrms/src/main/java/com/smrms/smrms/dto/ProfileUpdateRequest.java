package com.smrms.smrms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {
    private String fullname;
    private String mobileNumber;

    // ✅ Add this field so you can update password too
    private String password;
}
