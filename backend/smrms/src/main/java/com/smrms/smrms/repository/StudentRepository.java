package com.smrms.smrms.repository;

import com.smrms.smrms.dto.StudentViewDTO;
import com.smrms.smrms.entity.Student;
import com.smrms.smrms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {

    // ✅ JPQL constructor query matching StudentViewDTO (7 arguments)
    @Query("SELECT new com.smrms.smrms.dto.StudentViewDTO(" +
            " s.id, u.fullname, u.email, u.mobileNumber, " +
            " s.studentDepartment, s.studentIdNumber, " +
            " '', u.avatarUrl" +
            ") FROM Student s JOIN s.user u")
    List<StudentViewDTO> findAllStudentViews();

    Optional<Student> findByUser(User user);
}
