package com.smrms.smrms.dto;

import lombok.*;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueSummaryDTO {

    private String id;
    private String issueTitle;
    private String issueDescription;
    private String issueLocation;
    private String exactLocation;

    private String issuePriority;
    private String issueStatus;
    private Instant issueCreatedAt;

    // Building
    private String buildingId;
    private String buildingName;

    // Files
    private String issuePhotoUrl;
    private String issueReportFile;

    // Reporter (IMPORTANT FOR EDIT BUTTON)
    private String reportedById;
    private String reportedByName;

    // Resolver
    private String resolvedById;
    private String resolvedByName;
}
