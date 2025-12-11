package com.smrms.smrms.controller;

import com.smrms.smrms.dto.IssuesDashboardStatsDTO;
import com.smrms.smrms.dto.MonthlyIssueDTO;
import com.smrms.smrms.service.AdminStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminStatsController {

    private final AdminStatsService adminStatsService;

    @GetMapping("/dashboard")
    public IssuesDashboardStatsDTO getDashboardStats() {
        return adminStatsService.getDashboardStats();
    }

    /**
     * ✅ NEW ENDPOINT: Get monthly issues data
     */
    @GetMapping("/stats/monthly-issues")
    public List<MonthlyIssueDTO> getMonthlyIssues() {
        return adminStatsService.getMonthlyIssues();
    }
}