// src/utils/auth.js
export const getAuthToken = () => {
  try {
    const adminDetails = sessionStorage.getItem("adminDetails");
    if (!adminDetails) return null;
    const parsed = JSON.parse(adminDetails);
    return parsed.token || null;
  } catch {
    return null;
  }
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const API_BASE = "http://31.97.206.144:5000/api";