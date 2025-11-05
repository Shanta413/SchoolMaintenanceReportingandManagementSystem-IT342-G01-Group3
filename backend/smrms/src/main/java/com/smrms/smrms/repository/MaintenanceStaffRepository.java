package com.smrms.smrms.repository;

import com.smrms.smrms.entity.MaintenanceStaff;
import com.smrms.smrms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MaintenanceStaffRepository extends JpaRepository<MaintenanceStaff, String> {
    Optional<MaintenanceStaff> findByUser(User user);
}
