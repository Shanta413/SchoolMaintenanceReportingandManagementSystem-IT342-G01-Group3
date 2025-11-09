package com.smrms.smrms.controller;

import com.smrms.smrms.dto.StudentViewDTO;
import com.smrms.smrms.entity.Student;
import com.smrms.smrms.entity.User;
import com.smrms.smrms.repository.StudentRepository;
import com.smrms.smrms.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class StudentController {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // ✅ Step 1: inject PasswordEncoder

    // 🟢 Get all students (DTO-based)
    @GetMapping
    public ResponseEntity<List<StudentViewDTO>> getAllStudents() {
        List<StudentViewDTO> students = studentRepository.findAllStudentViews();
        return ResponseEntity.ok(students);
    }

    // 🟢 Get one student by ID
    @GetMapping("/{id}")
    public ResponseEntity<StudentViewDTO> getStudentById(@PathVariable String id) {
        Optional<Student> studentOpt = studentRepository.findById(id);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Student s = studentOpt.get();
        User u = s.getUser();

        StudentViewDTO dto = new StudentViewDTO(
                s.getId(),
                u.getFullname(),
                u.getEmail(),
                u.getMobileNumber(),
                s.getStudentDepartment(),
                s.getStudentIdNumber(),
                "",                 // password placeholder
                u.getAvatarUrl()    // ✅ new field
        );

        return ResponseEntity.ok(dto);
    }

    // 🟢 Add new student (auto-create local user if email not found)
    @PostMapping
    @Transactional
    public ResponseEntity<String> addStudent(@RequestBody StudentViewDTO dto) {
        Optional<User> userOpt = userRepository.findByEmail(dto.getEmail());
        User user;

        if (userOpt.isPresent()) {
            user = userOpt.get();
        } else {
            // 🟢 Step 2: Properly encode password + set createdAt
            user = User.builder()
                    .fullname(dto.getFullname())
                    .email(dto.getEmail())
                    .mobileNumber(dto.getMobileNumber())
                    .password(passwordEncoder.encode(
                            dto.getPassword() != null ? dto.getPassword() : "password123"
                    )) // ✅ encode password properly
                    .authMethod("LOCAL")
                    .isActive(true)
                    .createdAt(LocalDateTime.now()) // ✅ prevent null constraint error
                    .build();
            userRepository.save(user);
        }

        Student student = Student.builder()
                .user(user)
                .studentDepartment(dto.getStudentDepartment())
                .studentIdNumber(dto.getStudentIdNumber())
                .build();

        studentRepository.save(student);
        return ResponseEntity.ok("Student added successfully");
    }

    // 🟡 Update student info
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<String> updateStudent(@PathVariable String id, @RequestBody StudentViewDTO dto) {
        Optional<Student> existing = studentRepository.findById(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();

        Student student = existing.get();
        User user = student.getUser();

        // ✅ Update user details
        if (dto.getFullname() != null) user.setFullname(dto.getFullname());
        if (dto.getMobileNumber() != null) user.setMobileNumber(dto.getMobileNumber());
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        userRepository.save(user);

        // ✅ Update student details
        if (dto.getStudentDepartment() != null) student.setStudentDepartment(dto.getStudentDepartment());
        if (dto.getStudentIdNumber() != null) student.setStudentIdNumber(dto.getStudentIdNumber());
        studentRepository.save(student);

        return ResponseEntity.ok("Student updated successfully");
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<String> deleteStudent(@PathVariable String id) {
        Optional<Student> studentOpt = studentRepository.findById(id);

        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Student not found");
        }

        Student student = studentOpt.get();

        // 🔥 Ensure deletion of both student and linked user
        if (student.getUser() != null) {
            userRepository.delete(student.getUser());
        }

        studentRepository.delete(student);
        studentRepository.flush(); // ✅ force Hibernate to execute immediately

        return ResponseEntity.ok("Student and linked user deleted successfully");
    }
}
