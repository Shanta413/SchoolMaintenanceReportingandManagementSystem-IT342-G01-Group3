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
export async function createIssue(issueData, photoFile = null) {
  const formData = new FormData();
  formData.append(
    "data",
    new Blob([JSON.stringify(issueData)], { type: "application/json" })
  );
  if (photoFile) formData.append("photo", photoFile);

  const { data } = await api.post("/issues", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}

// Update issue (optional, not used in student flow)
export async function updateIssue(issueId, updateData) {
  const { data } = await api.put(`/issues/${issueId}`, updateData);
  return data;
}

// Delete issue (admin/staff only)
export async function deleteIssue(issueId) {
  const { data } = await api.delete(`/issues/${issueId}`);
  return data;
}
