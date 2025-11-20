// src/api/staff.js
import api from "./axios";

export async function getAllStaff() {
  const res = await api.get("/staff"); // backend should provide /api/staff
  return res.data;
}