package com.smrms.smrms.repository;

import com.smrms.smrms.entity.Student;
import com.smrms.smrms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, String> {
    Optional<Student> findByUser(User user);
}
