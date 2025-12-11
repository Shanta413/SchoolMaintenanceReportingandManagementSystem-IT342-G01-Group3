package com.smrms.smrms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyIssueDTO {
    private String month;  // e.g., "Jan 2024"
    private long count;    // number of issues
}