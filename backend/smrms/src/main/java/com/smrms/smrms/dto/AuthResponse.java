package com.smrms.smrms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ✅ AuthResponse used for /register and /login responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String id;           // ← USER ID (UUID)
    private String token;
    private String email;
    private String fullname;     // ← USER FULL NAME
    private String avatarUrl;    // ← USER AVATAR
    private String role;
    private String message;
}