package com.smrms.smrms.service;

import com.smrms.smrms.dto.*;
import com.smrms.smrms.entity.*;
import com.smrms.smrms.repository.*;
import com.smrms.smrms.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final StudentRepository studentRepository;
    private final MaintenanceStaffRepository maintenanceStaffRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    /**
     * REGISTER LOCAL USER
     */
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

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

        Role studentRole = roleRepository.findByRoleName("STUDENT")
                .orElseGet(() -> roleRepository.save(
                        Role.builder()
                                .roleName("STUDENT")
                                .roleCreatedAt(LocalDateTime.now())
                                .build()
                ));

        UserRole userRole = UserRole.builder()
                .user(user)
                .role(studentRole)
                .userRoleCreatedAt(LocalDateTime.now())
                .build();
        userRoleRepository.save(userRole);

        Student student = Student.builder()
                .user(user)
                .studentDepartment(request.getStudentDepartment())
                .studentIdNumber(request.getStudentIdNumber())
                .build();
        studentRepository.save(student);

        String jwtToken = jwtService.generateToken(user.getEmail());

        return AuthResponse.builder()
                .id(user.getId())              // ← ADD USER ID
                .token(jwtToken)
                .email(user.getEmail())
                .fullname(user.getFullname())  // ← ADD FULLNAME
                .avatarUrl(user.getAvatarUrl()) // ← ADD AVATAR
                .role("STUDENT")
                .message("Registered successfully")
                .build();
    }

    /**
     * LOGIN LOCAL USER
     * (Google accounts blocked here)
     */
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // ⛔ BLOCK GOOGLE ACCOUNTS FROM PASSWORD LOGIN
        if ("GOOGLE".equalsIgnoreCase(user.getAuthMethod())) {
            throw new RuntimeException("This account uses Google Sign‑In. Please login with Google.");
        }

        // LOCAL accounts → check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String roleName = userRoleRepository.findByUser(user)
                .map(userRole -> userRole.getRole().getRoleName())
                .orElse("STUDENT");

        String jwtToken = jwtService.generateToken(user.getEmail());

        return AuthResponse.builder()
                .id(user.getId())              // ← ADD USER ID
                .token(jwtToken)
                .email(user.getEmail())
                .fullname(user.getFullname())  // ← ADD FULLNAME
                .avatarUrl(user.getAvatarUrl()) // ← ADD AVATAR
                .role(roleName)
                .message("Login successful")
                .build();
    }
}