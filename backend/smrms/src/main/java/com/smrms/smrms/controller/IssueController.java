package com.smrms.smrms.controller;

import com.smrms.smrms.dto.*;
import com.smrms.smrms.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;

    // ========== CREATE ISSUE ==========
    @PostMapping(consumes = "multipart/form-data")
    public IssueResponse createIssue(
            Authentication auth,
            @RequestPart("data") IssueRequest req,
            @RequestPart(value = "photo", required = false) MultipartFile photo,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) throws Exception {
        return issueService.createIssue(auth.getName(), req, photo, file);
    }

    // ========== GET ALL ==========
    @GetMapping
    public List<IssueSummaryDTO> getAll() {
        return issueService.getAllIssues();
    }

    // ========== GET BY BUILDING ==========
    @GetMapping("/building/{id}")
    public List<IssueSummaryDTO> getByBuilding(@PathVariable String id) {
        return issueService.getIssuesByBuilding(id);
    }

    // ========== GET ONE ==========
    @GetMapping("/{id}")
    public IssueResponse getOne(@PathVariable String id) {
        return issueService.getIssue(id);
    }

    // ========== UPDATE ISSUE ==========
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public IssueResponse updateIssue(
            @PathVariable String id,
            Authentication auth,
            @RequestPart("data") IssueUpdateRequest req,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) throws Exception {
        return issueService.updateIssue(id, req, auth.getName(), file);
    }

    // ========== DELETE ISSUE ==========
    @DeleteMapping("/{id}")
    public void deleteIssue(@PathVariable String id) {
        issueService.deleteIssue(id);
    }
}
