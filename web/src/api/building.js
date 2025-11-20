import api from "./axios";

/**
 * Create a new building with image upload
 * @param {Object} buildingData
 * @param {File} file
 */
export async function createBuilding(buildingData, file) {
  const formData = new FormData();
  formData.append("data", new Blob([JSON.stringify(buildingData)], { type: "application/json" }));
  formData.append("file", file);
  const { data } = await api.post("/buildings", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/**
 * Fetch all buildings (active by default)
 */
export async function getAllBuildings() {
  const { data } = await api.get("/buildings");
  return data;
}

/**
 * Fetch a single building by CODE (for /buildings/:code)
 * @param {string} buildingCode
 */
export async function getBuildingByCode(buildingCode) {
  const { data } = await api.get(`/buildings/code/${encodeURIComponent(buildingCode)}`);
  return data;
}

/**
 * Fetch a single building by ID (not used in new flow, but keep if needed)
 * @param {string} buildingId
 */
export async function getBuildingById(buildingId) {
  const { data } = await api.get(`/buildings/${buildingId}`);
  return data;
}

/**
 * Update building information (with or without image)
 * @param {string} buildingId
 * @param {Object} buildingData
 * @param {File} file
 */
export async function updateBuilding(buildingId, buildingData, file = null) {
  const formData = new FormData();
  formData.append("data", new Blob([JSON.stringify(buildingData)], { type: "application/json" }));
  if (file) {
    formData.append("file", file);
  }
  const { data } = await api.put(`/buildings/${buildingId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/**
 * Delete a building
 * @param {string} buildingId
 */
export async function deleteBuilding(buildingId) {
  const { data } = await api.delete(`/buildings/${buildingId}`);
  return data;
}

/**
 * Get building with issue statistics
 * @param {string} buildingId
 */
export async function getBuildingWithIssues(buildingId) {
  const { data } = await api.get(`/buildings/${buildingId}/issues`);
  return data;
}
