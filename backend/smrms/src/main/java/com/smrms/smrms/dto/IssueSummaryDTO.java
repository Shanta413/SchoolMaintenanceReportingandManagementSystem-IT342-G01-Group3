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
    private String buildingId;
    private String buildingName;
    private String issuePhotoUrl;
    private String issueReportFile; // <-- add this line
    private String reportedByName;
    private String resolvedById;    // <-- if you want to display the resolver in summary
    private String resolvedByName;
}
