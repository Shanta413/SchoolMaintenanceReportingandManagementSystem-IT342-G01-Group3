package com.smrms.smrms.repository;

import com.smrms.smrms.entity.User;
import com.smrms.smrms.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, String> {
    List<UserRole> findByUser(User user);
}
