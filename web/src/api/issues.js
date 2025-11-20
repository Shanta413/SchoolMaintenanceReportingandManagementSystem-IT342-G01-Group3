// src/api/issues.js
import api from './axios';

// Get all issues (for current user/student, or admin/staff)
export async function getAllIssues() {
  const { data } = await api.get("/issues");
  return data;
}

// Get issues by building (for filtering)
// Accepts either building ID or building code depending on backend
export async function getIssuesByBuilding(buildingCodeOrId) {
  const { data } = await api.get(`/issues/building/${buildingCodeOrId}`);
  return data;
}

// Get single issue details
export async function getIssueById(issueId) {
  const { data } = await api.get(`/issues/${issueId}`);
  return data;
}

// Create new issue (with optional image upload)
export async function createIssue(issueData, photoFile = null, reportFile = null) {
  const formData = new FormData();
  formData.append(
    "data",
    new Blob([JSON.stringify(issueData)], { type: "application/json" })
  );
  if (photoFile) formData.append("photo", photoFile);
  if (reportFile) formData.append("file", reportFile);

  const { data } = await api.post("/issues", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}

// Update issue (with optional resolution report file)
export async function updateIssue(issueId, updateData, resolutionFile = null) {
  const formData = new FormData();
  formData.append(
    "data",
    new Blob([JSON.stringify(updateData)], { type: "application/json" })
  );
  if (resolutionFile) formData.append("file", resolutionFile);

  const { data } = await api.put(`/issues/${issueId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}

// Delete issue (admin/staff only)
export async function deleteIssue(issueId) {
  const { data } = await api.delete(`/issues/${issueId}`);
  return data;
}
