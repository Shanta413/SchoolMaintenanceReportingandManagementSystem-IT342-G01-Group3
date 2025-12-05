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
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class MaintenanceStaffController {

    private final MaintenanceStaffRepository staffRepo;
    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final UserRoleRepository userRoleRepo;
    private final IssueRepository issueRepository;
    private final PasswordEncoder passwordEncoder;

    // GET: list
    @GetMapping
    public ResponseEntity<List<MaintenanceStaffViewDTO>> list() {
        return ResponseEntity.ok(staffRepo.findAllStaffViews());
    }

    // GET: one
    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceStaffViewDTO> getOne(@PathVariable String id) {
        return staffRepo.findById(id)
                .map(ms -> {
                    User u = ms.getUser();
                    return ResponseEntity.ok(
                            new MaintenanceStaffViewDTO(
                                    ms.getId(),
                                    u.getId(),
                                    u.getFullname(),
                                    u.getEmail(),
                                    u.getMobileNumber(),
                                    ms.getStaffId(),
                                    u.getAuthMethod()
                            )
                    );
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // POST: create
    @PostMapping
    @Transactional
    public ResponseEntity<?> create(@RequestBody MaintenanceStaffUpsertRequest req) {

        if (req.getEmail() == null || req.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body("Email is required");
        }

        if (req.getStaffId() == null || req.getStaffId().isBlank()) {
            return ResponseEntity.badRequest().body("Staff ID is required");
        }

        if (staffRepo.existsByStaffId(req.getStaffId())) {
            return ResponseEntity.badRequest().body("Staff ID already exists");
        }

        // user: reuse if existing or create new
        User user = userRepo.findByEmail(req.getEmail()).orElseGet(() -> {
            String pwd = (req.getPassword() != null && !req.getPassword().isBlank())
                    ? req.getPassword()
                    : "password123";

            User newUser = User.builder()
                    .fullname(Optional.ofNullable(req.getFullname()).orElse("Maintenance Staff"))
                    .email(req.getEmail())
                    .password(passwordEncoder.encode(pwd))
                    .mobileNumber(req.getMobileNumber())
                    .authMethod("LOCAL")
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .build();

            return userRepo.save(newUser);
        });

        // ensure role exists
        Role staffRole = roleRepo.findByRoleName("MAINTENANCE_STAFF")
                .orElseGet(() -> roleRepo.save(
                        Role.builder()
                                .roleName("MAINTENANCE_STAFF")
                                .roleCreatedAt(LocalDateTime.now())
                                .build()
                ));

        // assign role if not yet assigned
        if (!userRoleRepo.existsByUserAndRole(user, staffRole)) {
            userRoleRepo.save(
                    UserRole.builder()
                            .user(user)
                            .role(staffRole)
                            .userRoleCreatedAt(LocalDateTime.now())
                            .build()
            );
        }

        if (staffRepo.findByUser(user).isPresent()) {
            return ResponseEntity.badRequest().body("User is already linked to a maintenance staff record");
        }

        MaintenanceStaff ms = MaintenanceStaff.builder()
                .user(user)
                .staffId(req.getStaffId())
                .build();

        staffRepo.save(ms);

        return ResponseEntity.ok("Maintenance staff created");
    }

    // PUT: update
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody MaintenanceStaffUpsertRequest req) {

        Optional<MaintenanceStaff> optional = staffRepo.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        MaintenanceStaff ms = optional.get();
        User user = ms.getUser();

        // update user fields
        if (req.getFullname() != null && !req.getFullname().isBlank()) {
            user.setFullname(req.getFullname());
        }

        if (req.getMobileNumber() != null && !req.getMobileNumber().isBlank()) {
            user.setMobileNumber(req.getMobileNumber());
        }

        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(req.getPassword()));
            user.setPasswordUpdatedAt(LocalDateTime.now());
        }

        user.setUpdatedAt(LocalDateTime.now());
        userRepo.save(user);

        // update staff ID
        if (req.getStaffId() != null && !req.getStaffId().isBlank()) {

            if (!req.getStaffId().equals(ms.getStaffId()) && staffRepo.existsByStaffId(req.getStaffId())) {
                return ResponseEntity.badRequest().body("Staff ID already exists");
            }

            ms.setStaffId(req.getStaffId());
        }

        staffRepo.save(ms);

        return ResponseEntity.ok("Maintenance staff updated");
    }

    // DELETE: handle FK constraints properly
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> delete(@PathVariable String id) {

        Optional<MaintenanceStaff> optional = staffRepo.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.status(404).body("Maintenance staff not found");
        }

        MaintenanceStaff ms = optional.get();
        User user = ms.getUser();

        // nullify foreign references in issues table
        issueRepository.findAll().forEach(issue -> {
            if (issue.getReportedBy() != null && issue.getReportedBy().getId().equals(user.getId())) {
                issue.setReportedBy(null);
                issueRepository.save(issue);
            }

            if (issue.getResolvedBy() != null && issue.getResolvedBy().getId().equals(user.getId())) {
                issue.setResolvedBy(null);
                issueRepository.save(issue);
            }
        });

        // delete user-role relationship
        userRoleRepo.findAll().stream()
                .filter(ur -> ur.getUser().getId().equals(user.getId()))
                .forEach(userRoleRepo::delete);

        staffRepo.delete(ms);
        userRepo.delete(user);
        staffRepo.flush();

        return ResponseEntity.ok("Maintenance staff and linked user deleted");
    }
}
