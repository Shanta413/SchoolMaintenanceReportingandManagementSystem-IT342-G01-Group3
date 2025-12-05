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

    // ==========================
    // CREATE ISSUE
    // ==========================
    public IssueResponse createIssue(
            String userEmail,
            IssueRequest req,
            MultipartFile photo,
            MultipartFile reportFile
    ) throws Exception {

        User reporter = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Building building = buildingRepository.findById(req.getBuildingId())
                .orElseThrow(() -> new RuntimeException("Building not found: " + req.getBuildingId()));

        String photoUrl = null;
        if (photo != null && !photo.isEmpty()) {
            System.out.println("[CREATE] Uploading ISSUE PHOTO: " + photo.getOriginalFilename());
            photoUrl = storage.upload(photo, "image");
            System.out.println("[CREATE] Uploaded PHOTO URL: " + photoUrl);
        }

        String reportUrl = null;
        if (reportFile != null && !reportFile.isEmpty()) {
            System.out.println("[CREATE] Uploading REPORT FILE: " + reportFile.getOriginalFilename());
            reportUrl = storage.upload(reportFile, "document");
            System.out.println("[CREATE] Uploaded REPORT URL: " + reportUrl);
        } else {
            System.out.println("[CREATE] No report file uploaded.");
        }

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

    // ==========================
    // LIST ALL ISSUES
    // ==========================
    public List<IssueSummaryDTO> getAllIssues() {
        return issueRepository.findAllByOrderByIssueCreatedAtDesc()
                .stream()
                .map(this::mapToSummary)
                .toList();
    }

    // ==========================
    // GET ISSUES BY BUILDING
    // ==========================
    public List<IssueSummaryDTO> getIssuesByBuilding(String buildingId) {
        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new RuntimeException("Building not found: " + buildingId));

        return issueRepository.findByBuildingOrderByIssueCreatedAtDesc(building)
                .stream()
                .map(this::mapToSummary)
                .toList();
    }

    // ==========================
    // GET ISSUE DETAILS
    // ==========================
    public IssueResponse getIssue(String id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found: " + id));
        return mapToResponse(issue);
    }

    // ==========================
    // UPDATE ISSUE
    // ==========================
    public IssueResponse updateIssue(
            String id,
            IssueUpdateRequest req,
            String editorEmail,
            MultipartFile photo,
            MultipartFile reportFile
    ) throws Exception {

        System.out.println("==== UPDATE ISSUE DEBUG ====");
        System.out.println("IssueID: " + id);
        System.out.println("Received Status: " + req.getIssueStatus());
        System.out.println("Resolver Staff Id: " + req.getResolvedByStaffId());
        System.out.println("Building Code: " + req.getBuildingCode());
        System.out.println("Photo file: " + (photo != null ? photo.getOriginalFilename() : "null"));
        System.out.println("Report file: " + (reportFile != null ? reportFile.getOriginalFilename() : "null"));
        System.out.println("===================================");

        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found: " + id));

        // BASIC FIELDS
        if (req.getIssueTitle() != null)
            issue.setIssueTitle(req.getIssueTitle());
        if (req.getIssueDescription() != null)
            issue.setIssueDescription(req.getIssueDescription());
        if (req.getExactLocation() != null)
            issue.setExactLocation(req.getExactLocation());
        if (req.getIssuePriority() != null)
            issue.setIssuePriority(IssuePriority.valueOf(req.getIssuePriority().toUpperCase()));
        if (req.getIssueStatus() != null)
            issue.setIssueStatus(IssueStatus.valueOf(req.getIssueStatus().toUpperCase()));

        // BUILDING
        if (req.getBuildingCode() != null && !req.getBuildingCode().isBlank()) {
            Building newBuilding = buildingRepository.findByBuildingCode(req.getBuildingCode())
                    .orElseThrow(() -> new RuntimeException("Building not found: " + req.getBuildingCode()));
            issue.setBuilding(newBuilding);
            issue.setIssueLocation(newBuilding.getBuildingCode());
            System.out.println("[UPDATE] Building changed to: " + newBuilding.getBuildingName() + " (" + newBuilding.getBuildingCode() + ")");
        }

        // PHOTO UPLOAD
        if (photo != null && !photo.isEmpty()) {
            System.out.println("[UPDATE] Uploading NEW PHOTO: " + photo.getOriginalFilename());
            String newPhotoUrl = storage.upload(photo, "image");
            issue.setIssuePhotoUrl(newPhotoUrl);
            System.out.println("[UPDATE] Uploaded PHOTO URL: " + newPhotoUrl);
        }

        // ============ FIXED LOGIC ============
        // Handle status change to ACTIVE (revert resolved issue)
        if ("ACTIVE".equalsIgnoreCase(req.getIssueStatus())) {
            System.out.println("[UPDATE] Status changed to ACTIVE - clearing resolver and report file");
            issue.setResolvedBy(null);
            issue.setIssueCompletedAt(null);
            issue.setIssueReportFile(null);  // ✅ Clear the report file
        }
        // Handle FIXED status with resolver
        else if ("FIXED".equalsIgnoreCase(req.getIssueStatus())) {
            // Set resolver if provided
            if (req.getResolvedByStaffId() != null && !req.getResolvedByStaffId().isBlank()) {
                User resolver = userRepository.findById(req.getResolvedByStaffId())
                        .orElseThrow(() -> new RuntimeException("Resolver not found: " + req.getResolvedByStaffId()));
                issue.setResolvedBy(resolver);
                issue.setIssueCompletedAt(Instant.now());
                System.out.println("[UPDATE] Resolver set to: " + resolver.getFullname());
            }
            
            // Handle report file upload for FIXED status
            if (reportFile != null && !reportFile.isEmpty()) {
                System.out.println("[UPDATE] Uploading NEW REPORT FILE: " + reportFile.getOriginalFilename());
                String newUrl = storage.upload(reportFile, "document");
                issue.setIssueReportFile(newUrl);
                System.out.println("[UPDATE] Uploaded REPORT URL: " + newUrl);
            }
        }

        issueRepository.save(issue);
        return mapToResponse(issue);
    }

    // ==========================
    // DELETE ISSUE
    // ==========================
    public void deleteIssue(String id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found: " + id));
        issueRepository.delete(issue);
    }

    // ==========================
    // Convert Issue → Summary DTO
    // ==========================
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
                .issueReportFile(i.getIssueReportFile())
                .reportedById(i.getReportedBy() != null ? i.getReportedBy().getId() : null)
                .reportedByName(i.getReportedBy() != null ? i.getReportedBy().getFullname() : null)
                .resolvedById(i.getResolvedBy() != null ? i.getResolvedBy().getId() : null)
                .resolvedByName(i.getResolvedBy() != null ? i.getResolvedBy().getFullname() : null)
                .build();
    }

    // ==========================
    // Convert Issue → Full Response
    // ==========================
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