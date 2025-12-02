import api from "./axios";

/**
 * Create a new building with image upload
 * buildingData = { buildingCode: "SAL", buildingName: "Science and Laboratory" }
 */
export async function createBuilding(buildingData, file) {
  const formData = new FormData();

  // ⛔ OLD (remove this):
  // formData.append("data", new Blob([JSON.stringify(buildingData)], { type: "application/json" }));

  // ✅ NEW: top-level fields for @RequestParam
  formData.append("buildingCode", buildingData.buildingCode);
  formData.append("buildingName", buildingData.buildingName);

  // Attach file
  if (file) {
    formData.append("file", file);
  }

  const { data } = await api.post("/buildings", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/** Fetch all buildings */
export async function getAllBuildings() {
  const { data } = await api.get("/buildings");
  return data;
}

/** Fetch a building by CODE */
export async function getBuildingByCode(buildingCode) {
  const { data } = await api.get(`/buildings/code/${encodeURIComponent(buildingCode)}`);
  return data;
}

/** Fetch a building by ID */
export async function getBuildingById(buildingId) {
  const { data } = await api.get(`/buildings/${buildingId}`);
  return data;
}

/**
 * Update building information (with or without image)
 */
export async function updateBuilding(buildingId, buildingData, file = null) {
  const formData = new FormData();

  // ⛔ OLD JSON blob removed

  // ✅ NEW: send plain params
  formData.append("buildingCode", buildingData.buildingCode);
  formData.append("buildingName", buildingData.buildingName);

  // If user uploads a new file
  if (file) {
    formData.append("file", file);
  }

  const { data } = await api.put(`/buildings/${buildingId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/** Delete building */
export async function deleteBuilding(buildingId) {
  const { data } = await api.delete(`/buildings/${buildingId}`);
  return data;
}

/** Get building with issue statistics */
export async function getBuildingWithIssues(buildingId) {
  const { data } = await api.get(`/buildings/${buildingId}/issues`);
  return data;
}
