package com.smrms.smrms.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class IssueCountDTO {
    private long high;
    private long medium;
    private long low;
}
