package com.smrms.smrms.service;

import com.smrms.smrms.dto.BuildingIssueCountDTO;
import com.smrms.smrms.dto.IssuesDashboardStatsDTO;
import com.smrms.smrms.entity.Building;
import com.smrms.smrms.entity.IssuePriority;
import com.smrms.smrms.entity.IssueStatus;
import com.smrms.smrms.repository.BuildingRepository;
import com.smrms.smrms.repository.IssueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminStatsService {

    private final IssueRepository issueRepository;
    private final BuildingRepository buildingRepository;

    public IssuesDashboardStatsDTO getDashboardStats() {

        // ----------------------------
        // TOTAL ISSUES THIS MONTH
        // ----------------------------
        YearMonth now = YearMonth.now();

        Instant monthStart = now.atDay(1)
                .atStartOfDay(ZoneId.systemDefault())
                .toInstant();

        Instant monthEnd = now.plusMonths(1)
                .atDay(1)
                .atStartOfDay(ZoneId.systemDefault())
                .toInstant();

        long totalThisMonth =
                issueRepository.countByIssueCreatedAtBetween(monthStart, monthEnd);

        // ----------------------------
        // TOTAL ISSUES ALL TIME
        // ----------------------------
        long totalAllTime = issueRepository.count();

        // ----------------------------
        // STATUS SUMMARY
        // ----------------------------
        Map<String, Long> statusSummary = new HashMap<>();
        for (Object[] row : issueRepository.countByStatus()) {
            statusSummary.put(row[0].toString(), (Long) row[1]);
        }

        // ----------------------------
        // PRIORITY SUMMARY
        // ----------------------------
        Map<String, Long> prioritySummary = new HashMap<>();
        for (Object[] row : issueRepository.countByPriority()) {
            prioritySummary.put(row[0].toString(), (Long) row[1]);
        }

        // ----------------------------
        // BUILDING SUMMARY
        // ----------------------------
        List<BuildingIssueCountDTO> issuesByBuilding =
                buildingRepository.findAll()
                        .stream()
                        .map(b -> {
                            long total = issueRepository.countByBuilding(b);
                            long active = issueRepository.countByBuildingAndIssueStatus(b, IssueStatus.ACTIVE);
                            long resolved = issueRepository.countByBuildingAndIssueStatus(b, IssueStatus.FIXED);

                            return new BuildingIssueCountDTO(
                                    b.getBuildingCode(),
                                    b.getBuildingName(),
                                    total,
                                    active,
                                    resolved
                            );
                        })
                        .collect(Collectors.toList());

        // ----------------------------
        // RETURN DTO
        // ----------------------------
        return new IssuesDashboardStatsDTO(
                totalAllTime,
                totalThisMonth,
                statusSummary,
                prioritySummary,
                issuesByBuilding
        );
    }
}
