package com.smrms.smrms.controller;

import com.smrms.smrms.dto.MaintenanceStaffUpsertRequest;
import com.smrms.smrms.dto.MaintenanceStaffViewDTO;
import com.smrms.smrms.entity.*;
import com.smrms.smrms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')") // ⬅️ Admin-only
public class MaintenanceStaffController {

    private final MaintenanceStaffRepository staffRepo;
    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final UserRoleRepository userRoleRepo;
    private final PasswordEncoder passwordEncoder;

    // GET: list (DTO)
    @GetMapping
    public ResponseEntity<List<MaintenanceStaffViewDTO>> list() {
        return ResponseEntity.ok(staffRepo.findAllStaffViews());
    }

    // GET: one (DTO)
    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceStaffViewDTO> getOne(@PathVariable String id) {
        return staffRepo.findById(id)
                .map(ms -> {
                    User u = ms.getUser();
                    return ResponseEntity.ok(new MaintenanceStaffViewDTO(
                            ms.getId(), u.getFullname(), u.getEmail(), u.getMobileNumber(), ms.getStaffId()
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // POST: create (auto-create LOCAL user if needed, assign MAINTENANCE_STAFF role)
    @PostMapping
    @Transactional
    public ResponseEntity<?> create(@RequestBody MaintenanceStaffUpsertRequest req) {
        if (req.getEmail() == null || req.getEmail().isBlank())
            return ResponseEntity.badRequest().body("Email is required");
        if (req.getStaffId() == null || req.getStaffId().isBlank())
            return ResponseEntity.badRequest().body("Staff ID is required");
        if (staffRepo.existsByStaffId(req.getStaffId()))
            return ResponseEntity.badRequest().body("Staff ID already exists");

        // user: reuse or create
        User user = userRepo.findByEmail(req.getEmail()).orElseGet(() -> {
            String raw = (req.getPassword() != null && !req.getPassword().isBlank())
                    ? req.getPassword() : "password123";
            User nu = User.builder()
                    .fullname(Optional.ofNullable(req.getFullname()).orElse("Maintenance Staff"))
                    .email(req.getEmail())
                    .password(passwordEncoder.encode(raw))
                    .mobileNumber(req.getMobileNumber())
                    .authMethod("LOCAL")
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .build();
            return userRepo.save(nu);
        });

        // ensure role MAINTENANCE_STAFF
        Role staffRole = roleRepo.findByRoleName("MAINTENANCE_STAFF")
                .orElseGet(() -> roleRepo.save(Role.builder()
                        .roleName("MAINTENANCE_STAFF")
                        .roleCreatedAt(LocalDateTime.now())
                        .build()));
        if (!userRoleRepo.existsByUserAndRole(user, staffRole)) {
            userRoleRepo.save(UserRole.builder()
                    .user(user)
                    .role(staffRole)
                    .userRoleCreatedAt(LocalDateTime.now())
                    .build());
        }

        // create staff row (if not existing for this user)
        staffRepo.findByUser(user).ifPresent(ms -> {
            throw new RuntimeException("User already linked to a maintenance staff record");
        });

        MaintenanceStaff ms = MaintenanceStaff.builder()
                .user(user)
                .staffId(req.getStaffId())
                .build();
        staffRepo.save(ms);

        return ResponseEntity.ok("Maintenance staff created");
    }

    // PUT: update (name/mobile/password/staffId)
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody MaintenanceStaffUpsertRequest req) {
        Optional<MaintenanceStaff> opt = staffRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        MaintenanceStaff ms = opt.get();
        User user = ms.getUser();

        if (req.getFullname() != null && !req.getFullname().isBlank()) user.setFullname(req.getFullname());
        if (req.getMobileNumber() != null && !req.getMobileNumber().isBlank()) user.setMobileNumber(req.getMobileNumber());
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(req.getPassword()));
            user.setPasswordUpdatedAt(LocalDateTime.now());
        }
        user.setUpdateAt(LocalDateTime.now());
        userRepo.save(user);

        if (req.getStaffId() != null && !req.getStaffId().isBlank()) {
            if (!req.getStaffId().equals(ms.getStaffId()) && staffRepo.existsByStaffId(req.getStaffId()))
                return ResponseEntity.badRequest().body("Staff ID already exists");
            ms.setStaffId(req.getStaffId());
        }
        staffRepo.save(ms);

        return ResponseEntity.ok("Maintenance staff updated");
    }

    // DELETE: remove staff + linked user (like Student delete)
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> delete(@PathVariable String id) {
        Optional<MaintenanceStaff> opt = staffRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.status(404).body("Maintenance staff not found");

        MaintenanceStaff ms = opt.get();
        User u = ms.getUser();

        // delete both
        userRepo.delete(u);          // cascades user_roles, student (if any), etc.
        staffRepo.delete(ms);
        staffRepo.flush();

        return ResponseEntity.ok("Maintenance staff and linked user deleted");
    }
}
