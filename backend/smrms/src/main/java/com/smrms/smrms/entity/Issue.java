package com.smrms.smrms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Issue {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by_id")
    private User reportedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by_id")
    private User resolvedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id")
    private Building building;

    @Column(nullable = false)
    private String issueTitle;

    @Column(length = 1024)
    private String issueDescription;

    @Column(length = 255)
    private String issueLocation;

    @Column(length = 255)
    private String exactLocation; // still keep this if needed

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IssuePriority issuePriority; // HIGH, MEDIUM, LOW

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IssueStatus issueStatus; // ACTIVE, RESOLVED

    private Instant issueCreatedAt;
    private Instant issueCompletedAt;

    @Column(nullable = false)
    private Boolean issueIsActive = true;

    @Column(length = 512)
    private String issuePhotoUrl;

    @Column(length = 512)
    private String issueReportFile;

    // ====== resolutionNote REMOVED! ======

    // Add other fields as needed...
}
