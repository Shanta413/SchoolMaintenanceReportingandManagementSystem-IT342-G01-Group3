package com.smrms.smrms.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueRequest {
    private String issueTitle;
    private String issueDescription;
    private String issueLocation;
    private String issuePriority;   // HIGH / MEDIUM / LOW
    private String buildingId;
}
