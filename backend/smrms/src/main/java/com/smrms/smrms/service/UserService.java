package com.smrms.smrms.service;

import com.smrms.smrms.dto.ProfileResponse;
import com.smrms.smrms.dto.ProfileUpdateRequest;
import com.smrms.smrms.entity.Student;
import com.smrms.smrms.entity.User;
import com.smrms.smrms.repository.StudentRepository;
import com.smrms.smrms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * ✅ Fetch user profile details by email (from JWT principal)
     */
    public ProfileResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ✅ Fetch student details if available (via OneToOne relation)
        Student student = user.getStudent();

        return new ProfileResponse(
                user.getId(),  // 🔥 UUID String
                user.getFullname(),
                user.getEmail(),
                user.getMobileNumber(),
                user.isActive(),
                user.getCreatedAt(),
                user.getAvatarUrl(),
                user.getAuthMethod(),
                student != null ? student.getStudentDepartment() : null,
                student != null ? student.getStudentIdNumber() : null
        );
    }

    /**
     * ✅ Update user profile details (LOCAL or GOOGLE)
     * Allows updating:
     * - Full name
     * - Mobile number
     * - Department (student)
     * - Avatar image
     * - Password (for local users)
     */
    public ProfileResponse updateProfile(String email, ProfileUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ✅ Update user fields
        if (request.getFullname() != null && !request.getFullname().isBlank()) {
            user.setFullname(request.getFullname());
        }

        if (request.getMobileNumber() != null && !request.getMobileNumber().isBlank()) {
            user.setMobileNumber(request.getMobileNumber());
        }

        if (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        // ✅ Securely update password if provided (for LOCAL users)
        if (request.getPassword() != null && !request.getPassword().isBlank()
                && user.getAuthMethod().equalsIgnoreCase("LOCAL")) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setPasswordUpdatedAt(LocalDateTime.now());
        }

        user.setUpdateAt(LocalDateTime.now());

        // ✅ Handle Student record (optional for GOOGLE users)
        Student student = user.getStudent();
        if (student == null) {
            // Create if missing (for older Google accounts)
            student = Student.builder()
                    .user(user)
                    .studentDepartment(request.getStudentDepartment())
                    .studentIdNumber(request.getStudentIdNumber())
                    .build();
        } else {
            // Update existing student data if provided
            if (request.getStudentDepartment() != null && !request.getStudentDepartment().isBlank()) {
                student.setStudentDepartment(request.getStudentDepartment());
            }
            if (request.getStudentIdNumber() != null && !request.getStudentIdNumber().isBlank()) {
                student.setStudentIdNumber(request.getStudentIdNumber());
            }
        }

        // ✅ Save both User and Student entities
        userRepository.save(user);
        studentRepository.save(student);

        // ✅ Return updated profile response
        return new ProfileResponse(
                user.getId(),  // 🔥 UUID String
                user.getFullname(),
                user.getEmail(),
                user.getMobileNumber(),
                user.isActive(),
                user.getCreatedAt(),
                user.getAvatarUrl(),
                user.getAuthMethod(),
                student.getStudentDepartment(),
                student.getStudentIdNumber()
        );
    }
}
