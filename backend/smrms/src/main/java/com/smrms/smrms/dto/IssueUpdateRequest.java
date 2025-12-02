package com.smrms.smrms.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueUpdateRequest {
    private String issueTitle;
    private String issueDescription;
    private String issuePriority;   // HIGH / MEDIUM / LOW
    private String issueStatus;     // ACTIVE / RESOLVED, etc.
    private String issueLocation;
    private String exactLocation;
    private String resolvedByStaffId;
    // REMOVED: resolutionNotes
    // Add more fields if your frontend expects them!
}
