package com.smrms.smrms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    // ✅ Use manual UUID generation (remove @GeneratedValue)
    @Id
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    @Column(length = 255, nullable = false)
    private String fullname;

    @Column(length = 255, nullable = false, unique = true)
    private String email;

    @Column(length = 255, nullable = false)
    private String password;

    @Column(name = "mobile_number", length = 15)
    private String mobileNumber;

    @Column(name = "auth_method", length = 50)
    private String authMethod;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "update_at")
    private LocalDateTime updateAt;

    @Column(name = "password_updated_at")
    private LocalDateTime passwordUpdatedAt;

    // ✅ Cascade relationships remain the same
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<UserRole> userRoles = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Student> students;
}
