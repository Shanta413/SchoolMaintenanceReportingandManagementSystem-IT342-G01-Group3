package com.smrms.smrms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "building",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"building_code"}),
                @UniqueConstraint(columnNames = {"building_name"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Building {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "building_code", length = 50, nullable = false, unique = true)
    private String buildingCode;

    @Column(name = "building_name", length = 255, nullable = false, unique = true)
    private String buildingName;

    @Column(name = "building_is_active", nullable = false)
    private boolean buildingIsActive = true;

    @Column(name = "building_image_url", length = 500)
    private String buildingImageUrl;

    @Column(name = "building_created_at", nullable = false, updatable = false)
    private LocalDateTime buildingCreatedAt = LocalDateTime.now();

    @Column(name = "building_updated_at")
    private LocalDateTime buildingUpdatedAt;
}
