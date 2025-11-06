package com.smrms.smrms.controller;

import com.smrms.smrms.dto.ProfileResponse;
import com.smrms.smrms.dto.ProfileUpdateRequest;
import com.smrms.smrms.entity.Student;
import com.smrms.smrms.entity.User;
import com.smrms.smrms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ✅ GET: fetch current user profile
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));

            String studentDepartment = null;
            String studentIdNumber = null;

            // ✅ Fetch student info (if exists)
            if (user.getStudent() != null) {
                studentDepartment = user.getStudent().getStudentDepartment();
                studentIdNumber = user.getStudent().getStudentIdNumber();
            }

            // ✅ Build response DTO
            ProfileResponse response = new ProfileResponse(
                    user.getFullname(),
                    user.getEmail(),
                    user.getMobileNumber(),
                    user.isActive(),
                    user.getCreatedAt(),
                    user.getAvatarUrl(),
                    user.getAuthMethod(),
                    studentDepartment,
                    studentIdNumber
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // ✅ PUT: update profile info
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            Authentication authentication,
            @RequestBody ProfileUpdateRequest request
    ) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));

            // ✅ Update basic info
            if (request.getFullname() != null && !request.getFullname().isBlank()) {
                user.setFullname(request.getFullname());
            }
            if (request.getMobileNumber() != null && !request.getMobileNumber().isBlank()) {
                user.setMobileNumber(request.getMobileNumber());
            }
            if (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()) {
                user.setAvatarUrl(request.getAvatarUrl());
            }

            // ✅ Handle student info properly
            if (user.getStudent() == null) {
                user.setStudent(Student.builder()
                        .studentDepartment(request.getStudentDepartment())
                        .studentIdNumber(request.getStudentIdNumber())
                        .user(user)
                        .build());
            } else {
                if (request.getStudentDepartment() != null && !request.getStudentDepartment().isBlank()) {
                    user.getStudent().setStudentDepartment(request.getStudentDepartment());
                }
                if (request.getStudentIdNumber() != null && !request.getStudentIdNumber().isBlank()) {
                    user.getStudent().setStudentIdNumber(request.getStudentIdNumber());
                }
            }

            // ✅ Update password if provided
            if (request.getPassword() != null && !request.getPassword().isBlank()) {
                user.setPassword(passwordEncoder.encode(request.getPassword()));
                user.setPasswordUpdatedAt(LocalDateTime.now());
            }

            user.setUpdateAt(LocalDateTime.now());
            userRepository.save(user);

            return ResponseEntity.ok("✅ Profile updated successfully!");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error updating profile: " + e.getMessage());
        }
    }
}
