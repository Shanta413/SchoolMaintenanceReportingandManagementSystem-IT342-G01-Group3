package com.smrms.smrms.dto;

import java.time.LocalDateTime;

public record ProfileResponse(
        String fullname,
        String email,
        String mobileNumber,
        boolean isActive,
        LocalDateTime createdAt
) {}
