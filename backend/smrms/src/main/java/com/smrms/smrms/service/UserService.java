package com.smrms.smrms.service;

import com.smrms.smrms.dto.ProfileResponse;
import com.smrms.smrms.dto.ProfileUpdateRequest;
import com.smrms.smrms.entity.User;
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
    private final PasswordEncoder passwordEncoder;

    public ProfileResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new ProfileResponse(
                user.getFullname(),
                user.getEmail(),
                user.getMobileNumber(),
                user.isActive(),
                user.getCreatedAt()
        );
    }

    public ProfileResponse updateProfile(String email, ProfileUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ✅ Update name and mobile
        if (request.getFullname() != null && !request.getFullname().isBlank()) {
            user.setFullname(request.getFullname());
        }

        if (request.getMobileNumber() != null && !request.getMobileNumber().isBlank()) {
            user.setMobileNumber(request.getMobileNumber());
        }

        // ✅ Encode new password safely (if provided)
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setPasswordUpdatedAt(LocalDateTime.now());
        }

        // ✅ Update timestamp
        user.setUpdateAt(LocalDateTime.now());

        userRepository.save(user);

        return new ProfileResponse(
                user.getFullname(),
                user.getEmail(),
                user.getMobileNumber(),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}
