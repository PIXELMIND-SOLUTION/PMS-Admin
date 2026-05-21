// // src/utils/auth.js
// export const getAuthToken = () => {
//   try {
//     const adminDetails = sessionStorage.getItem("adminDetails");
//     if (!adminDetails) return null;
//     const parsed = JSON.parse(adminDetails);
//     return parsed.token || null;
//   } catch {
//     return null;
//   }
// };

// export const getAuthHeaders = () => {
//   const token = getAuthToken();
//   return {
//     "Content-Type": "application/json",
//     ...(token && { Authorization: `Bearer ${token}` }),
//   };
// };



// utils/Auth.js


export const API_BASE = "https://pmsbackend.pixelmindsolutions.com/api";

export const API_BASE_URL = "https://pmsbackend.pixelmindsolutions.com/api";


export const getAuthHeaders = () => {
  try {
    const adminDetails = JSON.parse(sessionStorage.getItem("adminDetails"));
    const token = adminDetails?.token;
    
    if (!token) {
      console.warn("No auth token found in sessionStorage");
      return {};
    }
    
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };
  } catch (error) {
    console.error("Error getting auth headers:", error);
    return {};
  }
};

// Optional: Function to check if user is authenticated
export const isAuthenticated = () => {
  try {
    const adminDetails = JSON.parse(sessionStorage.getItem("adminDetails"));
    return !!adminDetails?.token;
  } catch {
    return false;
  }
};

// Optional: Function to get token
export const getToken = () => {
  try {
    const adminDetails = JSON.parse(sessionStorage.getItem("adminDetails"));
    return adminDetails?.token || null;
  } catch {
    return null;
  }
};
