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

// 🔹 Create issue (photo optional)
export async function createIssue(issueData, photoFile = null) {
  const formData = new FormData();

  formData.append(
    "data",
    new Blob([JSON.stringify(issueData)], { type: "application/json" })
  );

  if (photoFile) {
    formData.append("photo", photoFile);
  }

  const { data } = await api.post("/issues", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

// 🔹 Update issue (photo or resolution PDF optional)
export async function updateIssue(
  issueId,
  updateData,
  photoFile = null,
  resolutionFile = null
) {
  const formData = new FormData();

  formData.append(
    "data",
    new Blob([JSON.stringify(updateData)], { type: "application/json" })
  );

  if (photoFile) {
    formData.append("photo", photoFile);
  }
  if (resolutionFile) {
    formData.append("file", resolutionFile);
  }

  const { data } = await api.put(`/issues/${issueId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

// 🔹 Delete issue
export async function deleteIssue(issueId) {
  const { data } = await api.delete(`/issues/${issueId}`);
  return data;
}
