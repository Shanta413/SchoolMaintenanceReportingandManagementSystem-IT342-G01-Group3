package com.smrms.smrms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "oauth")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OAuth {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(name = "oauth_provider", length = 100, nullable = false)
    private String oauthProvider; // "Google"

    @Column(name = "oauth_provider_id", length = 255, nullable = false)
    private String oauthProviderId;

    @Column(name = "oauth_provider_email", length = 255)
    private String oauthProviderEmail;

    @Column(name = "oauth_created_at", nullable = false)
    private LocalDateTime oauthCreatedAt = LocalDateTime.now();
}
