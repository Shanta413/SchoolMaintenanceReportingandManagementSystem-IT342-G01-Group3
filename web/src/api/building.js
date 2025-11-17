// src/api/building.js
import api from './axios';

/**
 * Create a new building with image upload
 */
export async function createBuilding(buildingData, file) {
  const formData = new FormData();
  formData.append("data", new Blob([JSON.stringify(buildingData)], { type: "application/json" }));
  formData.append("file", file);
  const { data } = await api.post("/buildings", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}

/**
 * Fetch all buildings
 */
export async function getAllBuildings() {
  const { data } = await api.get("/buildings");
  return data;
}

/**
 * Fetch a single building by ID
 */
export async function getBuildingById(buildingId) {
  const { data } = await api.get(`/buildings/${buildingId}`);
  return data;
}

/**
 * Update building information
 */
export async function updateBuilding(buildingId, buildingData, file = null) {
  const formData = new FormData();
  formData.append("data", new Blob([JSON.stringify(buildingData)], { type: "application/json" }));
  if (file) {
    formData.append("file", file);
  }
  const { data } = await api.put(`/buildings/${buildingId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}

/**
 * Delete a building
 */
export async function deleteBuilding(buildingId) {
  const { data } = await api.delete(`/buildings/${buildingId}`);
  return data;
}

/**
 * Get building with issue statistics
 */
export async function getBuildingWithIssues(buildingId) {
  const { data } = await api.get(`/buildings/${buildingId}/issues`);
  return data;
}