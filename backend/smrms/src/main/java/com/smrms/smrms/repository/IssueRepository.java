package com.smrms.smrms.repository;

import com.smrms.smrms.entity.Building;
import com.smrms.smrms.entity.Issue;
import com.smrms.smrms.entity.IssuePriority;
import com.smrms.smrms.entity.IssueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<Issue, String> {

    // Count issues between date ranges (MUST use Instant)
    long countByIssueCreatedAtBetween(Instant start, Instant end);

    // Count by status
    @Query("SELECT i.issueStatus, COUNT(i) FROM Issue i GROUP BY i.issueStatus")
    List<Object[]> countByStatus();

    // Count by priority
    @Query("SELECT i.issuePriority, COUNT(i) FROM Issue i GROUP BY i.issuePriority")
    List<Object[]> countByPriority();

    // For per‑building stats
    @Query("SELECT new com.smrms.smrms.dto.BuildingIssueCountDTO(i.building.buildingCode, i.building.buildingName, COUNT(i)) " +
            "FROM Issue i GROUP BY i.building.buildingCode, i.building.buildingName")
    List<com.smrms.smrms.dto.BuildingIssueCountDTO> countByBuilding();

    // Get issues by building
    List<Issue> findByBuildingOrderByIssueCreatedAtDesc(Building building);

    List<Issue> findAllByOrderByIssueCreatedAtDesc();

    // OLD: Count all issues (including resolved)
    long countByBuildingAndIssuePriority(Building building, IssuePriority priority);

    // ✅ NEW: Count only ACTIVE issues (excludes RESOLVED)
    long countByBuildingAndIssuePriorityAndIssueStatusNot(
        Building building, 
        IssuePriority priority, 
        IssueStatus excludeStatus
    );

    long countByBuilding(Building building);

    long countByBuildingAndIssueStatus(Building building, IssueStatus status);

    List<Issue> findByReportedByIdOrderByIssueCreatedAtDesc(String userId);
}