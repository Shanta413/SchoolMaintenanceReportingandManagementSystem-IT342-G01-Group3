package com.smrms.smrms.controller;

import com.smrms.smrms.dto.IssuesDashboardStatsDTO;
import com.smrms.smrms.service.AdminStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminStatsController {

    private final AdminStatsService adminStatsService;

    @GetMapping
    public IssuesDashboardStatsDTO getDashboardStats() {
        return adminStatsService.getDashboardStats();
    }
}
