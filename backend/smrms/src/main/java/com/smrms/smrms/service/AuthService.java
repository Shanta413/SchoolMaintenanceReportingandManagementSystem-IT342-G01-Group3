package com.smrms.smrms.service;

import com.smrms.smrms.dto.*;
import com.smrms.smrms.entity.*;
import com.smrms.smrms.repository.*;
import com.smrms.smrms.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final StudentRepository studentRepository;
    private final MaintenanceStaffRepository maintenanceStaffRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse register(RegisterRequest request) {
        // Create user
        User user = User.builder()
                .fullname(request.getFullname())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .mobileNumber(request.getMobileNumber())
                .authMethod("LOCAL")
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        // Assign default role
        Role role = roleRepository.findByRoleName("Student")
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .roleName("Student")
                        .roleCreatedAt(LocalDateTime.now())
                        .build()));

        userRoleRepository.save(UserRole.builder()
                .user(user)
                .role(role)
                .userRoleCreatedAt(LocalDateTime.now())
                .build());

        // Save student info
        studentRepository.save(Student.builder()
                .user(user)
                .studentIdNumber(request.getStudentIdNumber())
                .studentDepartment(request.getStudentDepartment())
                .build());

        String token = jwtService.generateToken(user.getEmail(), Collections.emptyMap());
        return new AuthResponse(token, "Registration successful!");
    }

    public AuthResponse login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) throw new RuntimeException("User not found!");

        User user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword()))
            throw new RuntimeException("Invalid password!");

        String token = jwtService.generateToken(user.getEmail(), Collections.emptyMap());
        return new AuthResponse(token, "Login successful!");
    }
}
