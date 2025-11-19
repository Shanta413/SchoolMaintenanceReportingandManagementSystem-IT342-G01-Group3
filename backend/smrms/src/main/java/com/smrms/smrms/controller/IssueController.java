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

    @PostMapping(consumes = "multipart/form-data")
    public IssueResponse createIssue(
            Authentication auth,
            @RequestPart("data") IssueRequest req,
            @RequestPart(value = "photo", required = false) MultipartFile photo,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) throws Exception {

        return issueService.createIssue(auth.getName(), req, photo, file);
    }

    @GetMapping
    public List<IssueSummaryDTO> getAll() {
        return issueService.getAllIssues();
    }

    @GetMapping("/building/{id}")
    public List<IssueSummaryDTO> getByBuilding(@PathVariable String id) {
        return issueService.getIssuesByBuilding(id);
    }

    @GetMapping("/{id}")
    public IssueResponse getOne(@PathVariable String id) {
        return issueService.getIssue(id);
    }
}
