package com.smrms.smrms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "roles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "role_name", length = 50, nullable = false, unique = true)
    private String roleName; // "Student", "Maintenance_Staff", "Admin"

    @Column(name = "role_created_at", nullable = false)
    private LocalDateTime roleCreatedAt = LocalDateTime.now();

    @Column(name = "role_update_at")
    private LocalDateTime roleUpdateAt;
}
