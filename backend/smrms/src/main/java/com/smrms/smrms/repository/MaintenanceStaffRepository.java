package com.smrms.smrms.repository;

import com.smrms.smrms.dto.MaintenanceStaffViewDTO;
import com.smrms.smrms.entity.MaintenanceStaff;
import com.smrms.smrms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface MaintenanceStaffRepository extends JpaRepository<MaintenanceStaff, String> {

    Optional<MaintenanceStaff> findByUser(User user);

    boolean existsByStaffId(String staffId);

    @Query("""
        SELECT new com.smrms.smrms.dto.MaintenanceStaffViewDTO(
            ms.id, u.fullname, u.email, u.mobileNumber, ms.staffId
        )
        FROM MaintenanceStaff ms
        JOIN ms.user u
        ORDER BY u.fullname ASC
    """)
    List<MaintenanceStaffViewDTO> findAllStaffViews();
}
