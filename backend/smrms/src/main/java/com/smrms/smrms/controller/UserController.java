package com.smrms.smrms.controller;

import com.smrms.smrms.dto.ProfileResponse;
import com.smrms.smrms.dto.ProfileUpdateRequest;
import com.smrms.smrms.entity.Student;
import com.smrms.smrms.entity.User;
import com.smrms.smrms.repository.UserRepository;
import com.smrms.smrms.service.SupabaseStorageService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:3000",
        "https://frontend-production-e168.up.railway.app"
})
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SupabaseStorageService supabaseStorageService;

    // ✅ GET: fetch current user profile (for logged-in user)
    @GetMapping("/profile")
    public ResponseEntity<? > getProfile(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));

            String studentDepartment = null;
            String studentIdNumber = null;

            if (user.getStudent() != null) {
                studentDepartment = user.getStudent().getStudentDepartment();
                studentIdNumber = user.getStudent().getStudentIdNumber();
            }

            ProfileResponse response = new ProfileResponse(
                    user.getId(),  // 🔥 Returns String UUID
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
            return ResponseEntity.status(500).body("Error fetching profile: " + e.getMessage());
        }
    }

    // ✅ PUT: update logged-in user profile (JSON body)
    @PutMapping("/profile")
    @Transactional
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

            if (request.getFullname() != null && !request.getFullname().isBlank()) {
                user.setFullname(request.getFullname());
            }
            if (request.getMobileNumber() != null && !request.getMobileNumber().isBlank()) {
                user.setMobileNumber(request.getMobileNumber());
            }

            // ✅ Handle student info properly
            if (user.getStudent() == null &&
                    (request.getStudentDepartment() != null || request.getStudentIdNumber() != null)) {
                user.setStudent(Student.builder()
                        .studentDepartment(request.getStudentDepartment())
                        .studentIdNumber(request.getStudentIdNumber())
                        .user(user)
                        .build());
            } else if (user.getStudent() != null) {
                if (request.getStudentDepartment() != null && !request.getStudentDepartment().isBlank()) {
                    user.getStudent().setStudentDepartment(request.getStudentDepartment());
                }
                if (request.getStudentIdNumber() != null && !request.getStudentIdNumber().isBlank()) {
                    user.getStudent().setStudentIdNumber(request.getStudentIdNumber());
                }
            }

            // ✅ Update password if provided (LOCAL users typically)
            if (request.getPassword() != null && !request.getPassword().isBlank()) {
                user.setPassword(passwordEncoder.encode(request.getPassword()));
                user.setPasswordUpdatedAt(LocalDateTime.now());
            }

            user.setUpdateAt(LocalDateTime.now());
            userRepository.saveAndFlush(user);

            return ResponseEntity.ok("✅ Profile updated successfully!");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error updating profile: " + e.getMessage());
        }
    }

    // ✅ PUT: update avatar via multipart (works for LOCAL and GOOGLE)
    @PutMapping(path = "/profile/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<?> updateAvatar(
            Authentication authentication,
            @RequestPart("file") MultipartFile file
    ) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));

            // ⬆️ upload to Supabase (service) — single-arg method!
            String publicUrl = supabaseStorageService.upload(file, "image");// For avatars/buildings/photos


            // persist to DB
            user.setAvatarUrl(publicUrl);
            user.setUpdateAt(LocalDateTime.now());
            userRepository.saveAndFlush(user);

            // return the new URL so frontend can refresh
            return ResponseEntity.ok(Map.of("avatarUrl", publicUrl));
        } catch (org.springframework.web.multipart.MaxUploadSizeExceededException e) {
            return ResponseEntity.status(413).body("File too large");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }

    // 🟦 Admin: Update any user by email (safe null handling)
    @PutMapping("/update/{email}")
    @Transactional
    public ResponseEntity<?> updateUserByAdmin(@PathVariable String email, @RequestBody Map<String, Object> data) {
        try {
            var userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

            var user = userOpt.get();

            // Extract basic fields
            String fullname = (String) data.getOrDefault("fullname", "");
            String mobileNumber = (String) data.getOrDefault("mobileNumber", "");
            String password = (String) data.getOrDefault("password", "");

            if (fullname != null && !fullname.isBlank()) user.setFullname(fullname);
            if (mobileNumber != null && !mobileNumber.isBlank()) user.setMobileNumber(mobileNumber);
            if (password != null && !password.isBlank()) {
                user.setPassword(passwordEncoder.encode(password));
                user.setPasswordUpdatedAt(LocalDateTime.now());
            }

            // 🔵 NEW EMAIL UPDATE HANDLING
            String newEmail = (String) data.getOrDefault("newEmail", "");
            if (newEmail != null && !newEmail.isBlank() && !user.getEmail().equals(newEmail)) {
                if (userRepository.existsByEmail(newEmail)) {
                    return ResponseEntity.badRequest().body("Email already exists!");
                }
                System.out.println("Changing email from " + user.getEmail() + " → " + newEmail);
                user.setEmail(newEmail);
            }

            user.setUpdateAt(LocalDateTime.now());
            userRepository.saveAndFlush(user);

            return ResponseEntity.ok("✅ User updated successfully!");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error updating user: " + e.getMessage());
        }
    }


}
