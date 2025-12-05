package com.smrms.smrms.controller;

import com.smrms.smrms.dto.StudentViewDTO;
import com.smrms.smrms.entity.Role;
import com.smrms.smrms.entity.Student;
import com.smrms.smrms.entity.User;
import com.smrms.smrms.entity.UserRole;
import com.smrms.smrms.repository.RoleRepository;
import com.smrms.smrms.repository.StudentRepository;
import com.smrms.smrms.repository.UserRepository;
import com.smrms.smrms.repository.UserRoleRepository;
import com.smrms.smrms.repository.IssueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final IssueRepository issueRepository;
    private final PasswordEncoder passwordEncoder;

    // GET all students with user info
    @GetMapping
    public ResponseEntity<List<StudentViewDTO>> getAllStudents() {
        List<Student> students = studentRepository.findAll();
        List<StudentViewDTO> studentDTOs = new ArrayList<>();

        for (Student student : students) {
            User user = student.getUser();
            StudentViewDTO dto = StudentViewDTO.builder()
                    .id(student.getStudentId().toString())
                    .fullname(user.getFullname())
                    .email(user.getEmail())
                    .mobileNumber(user.getMobileNumber())
                    .avatarUrl(user.getAvatarUrl())
                    .authMethod(user.getAuthMethod())
                    .studentDepartment(student.getStudentDepartment())
                    .studentIdNumber(student.getStudentIdNumber())
                    .build();
            studentDTOs.add(dto);
        }

        return ResponseEntity.ok(studentDTOs);
    }

    // GET student by ID
    @GetMapping("/{id}")
    public ResponseEntity<StudentViewDTO> getStudentById(@PathVariable Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        User user = student.getUser();
        StudentViewDTO dto = StudentViewDTO.builder()
                .id(student.getStudentId().toString())
                .fullname(user.getFullname())
                .email(user.getEmail())
                .mobileNumber(user.getMobileNumber())
                .avatarUrl(user.getAvatarUrl())
                .authMethod(user.getAuthMethod())
                .studentDepartment(student.getStudentDepartment())
                .studentIdNumber(student.getStudentIdNumber())
                .build();

        return ResponseEntity.ok(dto);
    }

    // POST - Create new student
    @PostMapping
    public ResponseEntity<?> createStudent(@RequestBody StudentViewDTO studentDTO) {
        try {
            // Check if email exists
            if (userRepository.findByEmail(studentDTO.getEmail()).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Email already exists"));
            }

            User user = User.builder()
                    .fullname(studentDTO.getFullname())
                    .email(studentDTO.getEmail())
                    .mobileNumber(studentDTO.getMobileNumber())
                    .password(passwordEncoder.encode(studentDTO.getPassword()))
                    .authMethod("LOCAL")
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .build();
            user = userRepository.save(user);

            Role studentRole = roleRepository.findByRoleName("STUDENT")
                    .orElseThrow(() -> new RuntimeException("STUDENT role not found"));

            UserRole userRole = UserRole.builder()
                    .user(user)
                    .role(studentRole)
                    .userRoleCreatedAt(LocalDateTime.now())
                    .build();
            userRoleRepository.save(userRole);

            Student student = Student.builder()
                    .user(user)
                    .studentDepartment(studentDTO.getStudentDepartment())
                    .studentIdNumber(studentDTO.getStudentIdNumber())
                    .build();
            student = studentRepository.save(student);

            StudentViewDTO responseDTO = StudentViewDTO.builder()
                    .id(student.getStudentId().toString())
                    .fullname(user.getFullname())
                    .email(user.getEmail())
                    .mobileNumber(user.getMobileNumber())
                    .avatarUrl(user.getAvatarUrl())
                    .authMethod(user.getAuthMethod())
                    .studentDepartment(student.getStudentDepartment())
                    .studentIdNumber(student.getStudentIdNumber())
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // PUT - Update student
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable Long id, @RequestBody StudentViewDTO studentDTO) {
        try {
            Student student = studentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            if (studentDTO.getStudentDepartment() != null) {
                student.setStudentDepartment(studentDTO.getStudentDepartment());
            }

            if (studentDTO.getStudentIdNumber() != null) {
                student.setStudentIdNumber(studentDTO.getStudentIdNumber());
            }

            studentRepository.save(student);

            User user = student.getUser();
            StudentViewDTO responseDTO = StudentViewDTO.builder()
                    .id(student.getStudentId().toString())
                    .fullname(user.getFullname())
                    .email(user.getEmail())
                    .mobileNumber(user.getMobileNumber())
                    .avatarUrl(user.getAvatarUrl())
                    .authMethod(user.getAuthMethod())
                    .studentDepartment(student.getStudentDepartment())
                    .studentIdNumber(student.getStudentIdNumber())
                    .build();

            return ResponseEntity.ok(responseDTO);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // DELETE - Delete student
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        try {
            Student student = studentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            User user = student.getUser();

            issueRepository.findAll().forEach(issue -> {
                if (issue.getCreatedBy() != null &&
                        issue.getCreatedBy().getUserId().equals(user.getUserId())) {
                    issue.setCreatedBy(null);
                    issueRepository.save(issue);
                }

                if (issue.getAssignedTo() != null &&
                        issue.getAssignedTo().getUserId().equals(user.getUserId())) {
                    issue.setAssignedTo(null);
                    issueRepository.save(issue);
                }
            });

            userRoleRepository.findAll().stream()
                    .filter(ur -> ur.getUser().getUserId().equals(user.getUserId()))
                    .forEach(userRoleRepository::delete);

            studentRepository.delete(student);
            userRepository.delete(user);

            return ResponseEntity.ok(Map.of("message", "Student deleted successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
