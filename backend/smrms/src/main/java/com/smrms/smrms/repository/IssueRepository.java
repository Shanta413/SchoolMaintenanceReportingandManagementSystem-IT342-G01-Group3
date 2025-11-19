package com.smrms.smrms.repository;

import com.smrms.smrms.entity.Issue;
import com.smrms.smrms.entity.Building;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, String> {

    List<Issue> findByBuildingOrderByIssueCreatedAtDesc(Building building);

    List<Issue> findAllByOrderByIssueCreatedAtDesc();
}
