// src/api/issues.js
import api from "./axios";

// 🔹 Get ALL issues
export async function getAllIssues() {
  const { data } = await api.get("/issues");
  return data;
}

// 🔹 Get issues per building (ID or Code — backend supports both)
export async function getIssuesByBuilding(buildingCodeOrId) {
  const { data } = await api.get(`/issues/building/${buildingCodeOrId}`);
  return data;
}

// 🔹 Get 1 issue
export async function getIssueById(issueId) {
  const { data } = await api.get(`/issues/${issueId}`);
  return data;
}

// 🔹 Create issue (photo and/or file optional)
export async function createIssue(issueData, photoFile = null, reportFile = null) {
  const formData = new FormData();

  // Attach the JSON payload as "data"
  formData.append(
    "data",
    new Blob([JSON.stringify(issueData)], { type: "application/json" })
  );

  if (photoFile) formData.append("photo", photoFile);
  if (reportFile) formData.append("file", reportFile);

  // Don't set Content-Type manually - let axios set it with the boundary
  const { data } = await api.post("/issues", formData);

  return data;
}

// 🔹 Update issue (photo and/or file optional, as per backend)
export async function updateIssue(issueId, updateData, photoFile = null, resolutionFile = null) {
  const formData = new FormData();

  formData.append(
    "data",
    new Blob([JSON.stringify(updateData)], { type: "application/json" })
  );

  if (photoFile) formData.append("photo", photoFile);
  if (resolutionFile) formData.append("file", resolutionFile);

  // Don't set Content-Type manually - let axios set it with the boundary
  const { data } = await api.put(`/issues/${issueId}`, formData);

  return data;
}

// 🔹 Delete issue
export async function deleteIssue(issueId) {
  const { data } = await api.delete(`/issues/${issueId}`);
  return data;
}
