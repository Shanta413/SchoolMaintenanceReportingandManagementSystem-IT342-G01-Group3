package com.smrms.smrms.repository;

import com.smrms.smrms.entity.Building;
import com.smrms.smrms.entity.Issue;
import com.smrms.smrms.entity.IssuePriority;
import com.smrms.smrms.entity.IssueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<Issue, String> {

    // 🔹 Count issues by building + priority
    long countByBuildingAndIssuePriority(Building building, IssuePriority priority);

    // 🔹 Count by building + status
    long countByBuildingAndIssueStatus(Building building, IssueStatus status);

    // 🔹 Get issues for a building
    List<Issue> findByBuildingOrderByIssueCreatedAtDesc(Building building);

    // 🔹 Get all issues sorted by created date (Fix for your error)
    List<Issue> findAllByOrderByIssueCreatedAtDesc();

    // 🔹 Issues by reporter
    List<Issue> findByReportedByIdOrderByIssueCreatedAtDesc(String userId);
}
