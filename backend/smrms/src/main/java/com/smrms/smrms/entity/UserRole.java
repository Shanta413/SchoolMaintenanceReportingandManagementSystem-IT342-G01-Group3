package com.smrms.smrms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRole {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;

    @Column(name = "user_role_created_at", nullable = false, updatable = false)
    private LocalDateTime userRoleCreatedAt;

    @Column(name = "user_role_updated_at")
    private LocalDateTime userRoleUpdatedAt;

    /**
     * ✅ Auto-set timestamps before insert/update
     */
    @PrePersist
    protected void onCreate() {
        this.userRoleCreatedAt = LocalDateTime.now();
        this.userRoleUpdatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.userRoleUpdatedAt = LocalDateTime.now();
    }
}
