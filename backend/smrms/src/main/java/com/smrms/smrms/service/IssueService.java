package com.smrms.smrms.service;

import com.smrms.smrms.dto.*;
import com.smrms.smrms.entity.*;
import com.smrms.smrms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final BuildingRepository buildingRepository;
    private final SupabaseStorageService storage;

    public IssueResponse createIssue(
            String userEmail,
            IssueRequest req,
            MultipartFile photo,
            MultipartFile reportFile
    ) throws Exception {

        // Debug: Print buildingId received
        System.out.println("Building ID received: " + req.getBuildingId());

        // Find user by email
        User reporter = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find building by ID (String type)
        Building building = buildingRepository.findById(req.getBuildingId())
                .orElseThrow(() -> new RuntimeException("Building not found: " + req.getBuildingId()));

        // Upload photo if provided
        String photoUrl = null;
        if (photo != null && !photo.isEmpty()) {
            photoUrl = storage.upload(photo);
        }

        // Upload report file if provided
        String reportUrl = null;
        if (reportFile != null && !reportFile.isEmpty()) {
            reportUrl = storage.upload(reportFile);
        }

        // Create and save the issue
        Issue issue = Issue.builder()
                .reportedBy(reporter)
                .building(building)
                .issueTitle(req.getIssueTitle())
                .issueDescription(req.getIssueDescription())
                .issueLocation(req.getIssueLocation())
                .issuePriority(IssuePriority.valueOf(req.getIssuePriority().toUpperCase()))
                .issueStatus(IssueStatus.ACTIVE)
                .issueCreatedAt(Instant.now())
                .issueIsActive(true)
                .issuePhotoUrl(photoUrl)
                .issueReportFile(reportUrl)
                .build();

        issueRepository.save(issue);

        return mapToResponse(issue);
    }

    public List<IssueSummaryDTO> getAllIssues() {
        return issueRepository.findAllByOrderByIssueCreatedAtDesc()
                .stream()
                .map(this::mapToSummary)
                .toList();
    }

    public List<IssueSummaryDTO> getIssuesByBuilding(String buildingId) {
        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new RuntimeException("Building not found: " + buildingId));

        return issueRepository.findByBuildingOrderByIssueCreatedAtDesc(building)
                .stream()
                .map(this::mapToSummary)
                .toList();
    }

    public IssueResponse getIssue(String id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found: " + id));

        return mapToResponse(issue);
    }

    // Converts Issue entity to IssueSummaryDTO for summary responses
    private IssueSummaryDTO mapToSummary(Issue i) {
        return IssueSummaryDTO.builder()
                .id(i.getId())
                .issueTitle(i.getIssueTitle())
                .issuePriority(i.getIssuePriority().name())
                .issueStatus(i.getIssueStatus().name())
                .issueCreatedAt(i.getIssueCreatedAt())
                .buildingId(i.getBuilding().getId())
                .buildingName(i.getBuilding().getBuildingName())
                .issuePhotoUrl(i.getIssuePhotoUrl())
                .reportedByName(i.getReportedBy() != null ? i.getReportedBy().getFullname() : null) // <-- this!
                .build();
    }

    // Converts Issue entity to full IssueResponse for details
    private IssueResponse mapToResponse(Issue i) {
        return IssueResponse.builder()
                .id(i.getId())
                .issueTitle(i.getIssueTitle())
                .issueDescription(i.getIssueDescription())
                .issueLocation(i.getIssueLocation())
                .issuePriority(i.getIssuePriority().name())
                .issueStatus(i.getIssueStatus().name())
                .issuePhotoUrl(i.getIssuePhotoUrl())
                .issueReportFile(i.getIssueReportFile())
                .issueCreatedAt(i.getIssueCreatedAt())
                .issueCompletedAt(i.getIssueCompletedAt())
                .buildingId(i.getBuilding().getId())
                .buildingName(i.getBuilding().getBuildingName())
                .reportedById(i.getReportedBy().getId())
                .reportedByName(i.getReportedBy().getFullname())
                .resolvedById(i.getResolvedBy() != null ? i.getResolvedBy().getId() : null)
                .resolvedByName(i.getResolvedBy() != null ? i.getResolvedBy().getFullname() : null)
                .build();
    }
}
