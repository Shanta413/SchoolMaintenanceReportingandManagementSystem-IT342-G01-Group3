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

        // Find user by email
        User reporter = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find building by ID
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
            System.out.println("[CREATE] Received report file: " + reportFile.getOriginalFilename());
            reportUrl = storage.upload(reportFile);
            System.out.println("[CREATE] Supabase uploaded report URL: " + reportUrl);
        } else {
            System.out.println("[CREATE] No report file received for this issue.");
        }

        // Create and save the issue
        Issue issue = Issue.builder()
                .reportedBy(reporter)
                .building(building)
                .issueTitle(req.getIssueTitle())
                .issueDescription(req.getIssueDescription())
                .issueLocation(req.getIssueLocation())
                .exactLocation(req.getExactLocation())
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

    public IssueResponse updateIssue(
            String id,
            IssueUpdateRequest req,
            String editorEmail,
            MultipartFile reportFile
    ) throws Exception {

        System.out.println("==== UPDATE ISSUE DEBUG ====");
        System.out.println("IssueID: " + id);
        System.out.println("Received Title: " + req.getIssueTitle());
        System.out.println("Received Status: " + req.getIssueStatus());
        System.out.println("ResolvedByStaffId from frontend: " + req.getResolvedByStaffId());
        System.out.println("Report file received: " + (reportFile != null ? reportFile.getOriginalFilename() : "null"));
        System.out.println("============================");

        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found: " + id));

        // Update basic fields
        if (req.getIssueTitle() != null)
            issue.setIssueTitle(req.getIssueTitle());

        if (req.getIssueDescription() != null)
            issue.setIssueDescription(req.getIssueDescription());

        if (req.getIssueLocation() != null)
            issue.setIssueLocation(req.getIssueLocation());

        if (req.getExactLocation() != null)
            issue.setExactLocation(req.getExactLocation());

        if (req.getIssuePriority() != null)
            issue.setIssuePriority(IssuePriority.valueOf(req.getIssuePriority().toUpperCase()));

        if (req.getIssueStatus() != null)
            issue.setIssueStatus(IssueStatus.valueOf(req.getIssueStatus().toUpperCase()));

        // RESOLVER (staff/technician)
        if (req.getResolvedByStaffId() != null && !req.getResolvedByStaffId().isBlank()) {

            System.out.println("Looking up resolver user ID: " + req.getResolvedByStaffId());

            User resolver = userRepository.findById(req.getResolvedByStaffId())
                    .orElseThrow(() -> new RuntimeException("Resolver not found: " + req.getResolvedByStaffId()));

            issue.setResolvedBy(resolver);

            // mark as completed if status = resolved
            if ("FIXED".equalsIgnoreCase(req.getIssueStatus()) || "RESOLVED".equalsIgnoreCase(req.getIssueStatus())) {
                issue.setIssueCompletedAt(Instant.now());
            }

        } else {
            // No staff selected
            System.out.println("No resolver selected.");

            // If status is not RESOLVED, remove resolver + completion time
            if (!"FIXED".equalsIgnoreCase(req.getIssueStatus()) && !"RESOLVED".equalsIgnoreCase(req.getIssueStatus())) {
                issue.setResolvedBy(null);
                issue.setIssueCompletedAt(null);
            }
        }

        // ============================
        // FILE UPLOAD
        // ============================
        if (reportFile != null && !reportFile.isEmpty()) {
            System.out.println("[UPDATE] Uploading report file: " + reportFile.getOriginalFilename());
            String reportUrl = storage.upload(reportFile);
            System.out.println("[UPDATE] Supabase uploaded report URL: " + reportUrl);
            issue.setIssueReportFile(reportUrl);
        } else {
            System.out.println("[UPDATE] No new report file uploaded.");
        }

        issueRepository.save(issue);

        return mapToResponse(issue);
    }

    public void deleteIssue(String id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found: " + id));
        issueRepository.delete(issue);
    }

    // Converts Issue entity to IssueSummaryDTO for summary responses
    private IssueSummaryDTO mapToSummary(Issue i) {
        return IssueSummaryDTO.builder()
                .id(i.getId())
                .issueTitle(i.getIssueTitle())
                .issueDescription(i.getIssueDescription())
                .issueLocation(i.getIssueLocation())
                .exactLocation(i.getExactLocation())
                .issuePriority(i.getIssuePriority().name())
                .issueStatus(i.getIssueStatus().name())
                .issueCreatedAt(i.getIssueCreatedAt())
                .buildingId(i.getBuilding().getId())
                .buildingName(i.getBuilding().getBuildingName())
                .issuePhotoUrl(i.getIssuePhotoUrl())
                .issueReportFile(i.getIssueReportFile()) // <-- include this!
                .reportedByName(i.getReportedBy() != null ? i.getReportedBy().getFullname() : null)
                .resolvedById(i.getResolvedBy() != null ? i.getResolvedBy().getId() : null)
                .resolvedByName(i.getResolvedBy() != null ? i.getResolvedBy().getFullname() : null)
                .build();
    }

    // Converts Issue entity to full IssueResponse for details
    private IssueResponse mapToResponse(Issue i) {
        return IssueResponse.builder()
                .id(i.getId())
                .issueTitle(i.getIssueTitle())
                .issueDescription(i.getIssueDescription())
                .issueLocation(i.getIssueLocation())
                .exactLocation(i.getExactLocation())
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
