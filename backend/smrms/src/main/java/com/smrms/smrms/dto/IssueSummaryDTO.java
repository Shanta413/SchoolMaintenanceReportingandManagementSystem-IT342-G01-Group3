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
    private String issuePriority;
    private String issueStatus;
    private String buildingId;
    private String buildingName;
    private String issuePhotoUrl;
    private Instant issueCreatedAt;
    private String reportedByName;  // <-- Make sure this exists!
}
