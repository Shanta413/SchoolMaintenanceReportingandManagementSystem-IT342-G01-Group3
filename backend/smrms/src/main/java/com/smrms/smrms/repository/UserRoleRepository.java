package com.smrms.smrms.repository;

import com.smrms.smrms.entity.Role;
import com.smrms.smrms.entity.User;
import com.smrms.smrms.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, String> {

    // ✅ For checking existing link
    boolean existsByUserAndRole(User user, Role role);

    // ✅ For loading roles of a given user
    List<UserRole> findByUser(User user);
}
