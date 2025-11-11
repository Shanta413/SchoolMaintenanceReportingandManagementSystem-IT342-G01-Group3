// src/api/user.js
import api from "./axios";

export async function uploadAvatar(file) {
  const fd = new FormData();
  fd.append("file", file);
  // do NOT set Content-Type manually
  const { data } = await api.put("/user/profile/avatar", fd);
  return data; // this is ProfileResponse with updated avatarUrl
}
