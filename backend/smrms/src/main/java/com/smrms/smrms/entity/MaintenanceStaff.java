package com.smrms.smrms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "maintenance_staff")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MaintenanceStaff {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(name = "staff_id", length = 50, nullable = false)
    private String staffId;
}
