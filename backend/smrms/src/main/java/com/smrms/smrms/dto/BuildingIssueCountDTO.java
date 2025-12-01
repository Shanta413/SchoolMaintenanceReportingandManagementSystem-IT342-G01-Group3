package com.smrms.smrms.dto;

public class BuildingIssueCountDTO {
    private String buildingCode;
    private String buildingName;
    private long issueCount;
    private long activeCount;     // NEW
    private long resolvedCount;   // NEW

    public BuildingIssueCountDTO() {}

    // Full constructor for all fields
    public BuildingIssueCountDTO(String buildingCode, String buildingName, long issueCount, long activeCount, long resolvedCount) {
        this.buildingCode = buildingCode;
        this.buildingName = buildingName;
        this.issueCount = issueCount;
        this.activeCount = activeCount;
        this.resolvedCount = resolvedCount;
    }

    // Old constructor for backward compatibility (won't populate active/resolved)
    public BuildingIssueCountDTO(String buildingCode, String buildingName, long issueCount) {
        this(buildingCode, buildingName, issueCount, 0, 0);
    }

    public String getBuildingCode() {
        return buildingCode;
    }

    public void setBuildingCode(String buildingCode) {
        this.buildingCode = buildingCode;
    }

    public String getBuildingName() {
        return buildingName;
    }

    public void setBuildingName(String buildingName) {
        this.buildingName = buildingName;
    }

    public long getIssueCount() {
        return issueCount;
    }

    public void setIssueCount(long issueCount) {
        this.issueCount = issueCount;
    }

    public long getActiveCount() {
        return activeCount;
    }

    public void setActiveCount(long activeCount) {
        this.activeCount = activeCount;
    }

    public long getResolvedCount() {
        return resolvedCount;
    }

    public void setResolvedCount(long resolvedCount) {
        this.resolvedCount = resolvedCount;
    }
}
