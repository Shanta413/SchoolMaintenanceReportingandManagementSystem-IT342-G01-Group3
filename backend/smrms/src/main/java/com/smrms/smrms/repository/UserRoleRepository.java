package com.smrms.smrms.repository;

import com.smrms.smrms.entity.User;
import com.smrms.smrms.entity.Role;
import com.smrms.smrms.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRoleRepository extends JpaRepository<UserRole, String> {
    Optional<UserRole> findByUser(User user);
    boolean existsByUserAndRole(User user, Role role);
}
