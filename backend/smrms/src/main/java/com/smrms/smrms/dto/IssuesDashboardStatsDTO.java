package com.smrms.smrms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IssuesDashboardStatsDTO {

    private long totalAllTime;      // <--- FIXED
    private long totalThisMonth;

    private Map<String, Long> statusSummary;
    private Map<String, Long> prioritySummary;

    private List<BuildingIssueCountDTO> issuesByBuilding;
}
