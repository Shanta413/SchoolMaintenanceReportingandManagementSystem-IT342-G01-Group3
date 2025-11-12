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
     * ✅ Register a new LOCAL user (default: STUDENT)
     */
    public AuthResponse register(RegisterRequest request) {

        // 🔍 Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // 🆕 Create a new user
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

        // 🎓 Assign default STUDENT role
        Role studentRole = roleRepository.findByRoleName("STUDENT")
                .orElseGet(() -> roleRepository.save(
                        Role.builder()
                                .roleName("STUDENT")
                                .roleCreatedAt(LocalDateTime.now())
                                .build()
                ));

        // 🧩 Link user to STUDENT role
        UserRole userRole = UserRole.builder()
                .user(user)
                .role(studentRole)
                .userRoleCreatedAt(LocalDateTime.now())
                .build();
        userRoleRepository.save(userRole);

        // 🧍 Create student profile
        Student student = Student.builder()
                .user(user)
                .studentDepartment(request.getStudentDepartment())
                .studentIdNumber(request.getStudentIdNumber())
                .build();
        studentRepository.save(student);

        // 🔑 Generate JWT
        String jwtToken = jwtService.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .role("STUDENT")
                .message("Registered successfully")
                .build();
    }

    /**
     * ✅ Login an existing LOCAL user (handles both ADMIN & STUDENT)
     */
    public AuthResponse login(LoginRequest request) {
        // 1️⃣ Find user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // 2️⃣ Verify password (only for LOCAL accounts)
        if ("LOCAL".equals(user.getAuthMethod()) &&
                !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        // 3️⃣ Get user's role (ADMIN, STUDENT, etc.)
        String roleName = userRoleRepository.findByUser(user)
                .map(userRole -> userRole.getRole().getRoleName())
                .orElse("STUDENT"); // default fallback

        // 4️⃣ Generate JWT
        String jwtToken = jwtService.generateToken(user.getEmail());

        // 5️⃣ Return success
        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .role(roleName)
                .message("Login successful")
                .build();
    }
}
