package com.smrms.smrms.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;

@Entity
@Table(name = "issue")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Issue {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    private String id;

    // User who reported the issue
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User reportedBy;

    // Maintenance Staff who resolved it (nullable)
    @ManyToOne
    @JoinColumn(name = "resolved_by", nullable = true)
    private User resolvedBy;

    // Building relationship
    @ManyToOne
    @JoinColumn(name = "building_id")
    private Building building;

    private String issueTitle;
    private String issueDescription;
    private String issueLocation;

    @Enumerated(EnumType.STRING)
    private IssuePriority issuePriority; // LOW, MEDIUM, HIGH

    @Enumerated(EnumType.STRING)
    private IssueStatus issueStatus;     // ACTIVE, FIXED

    private String issuePhotoUrl;   // optional
    private String issueReportFile; // optional PDF/DOC

    private Instant issueCreatedAt;
    private Instant issueCompletedAt;

    private boolean issueIsActive;
}
