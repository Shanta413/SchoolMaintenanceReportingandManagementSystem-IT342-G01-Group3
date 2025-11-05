package com.smrms.smrms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRole {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(name = "user_role_created_at", nullable = false)
    private LocalDateTime userRoleCreatedAt = LocalDateTime.now();  // ✅ Default

    @Column(name = "user_role_update_at")
    private LocalDateTime userRoleUpdateAt;
}
