package com.smrms.smrms.dto;

import lombok.*;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueResponse {

    private String id;
    private String issueTitle;
    private String issueDescription;
    private String issueLocation;
    private String exactLocation; // add this if needed by frontend
    private String issuePriority;
    private String issueStatus;

    private String issuePhotoUrl;
    private String issueReportFile;

    // Building info
    private String buildingId;
    private String buildingName;

    // Reporter
    private String reportedById;
    private String reportedByName;

    // Resolver
    private String resolvedById;
    private String resolvedByName;

    private Instant issueCreatedAt;
    private Instant issueCompletedAt;

    // REMOVED: resolutionNote/resolutionNotes
}
