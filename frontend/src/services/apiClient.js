import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api/v1",

  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },

  timeout: 30000,
});

// ======================================
// REQUEST INTERCEPTOR
// ======================================

API.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// ======================================
// RESPONSE INTERCEPTOR
// ======================================

API.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;

    switch (status) {
      case 400:
        console.warn("Bad Request");
        break;

      case 401:
        console.warn("Unauthorized");
        // Redirect mat karo
        // AuthContext + ProtectedRoute handle karega
        break;

      case 403:
        console.warn("Forbidden");
        break;

      case 404:
        console.warn("Resource Not Found");
        break;

      case 429:
        console.warn("Too Many Requests");
        break;

      case 500:
        console.error("Server Error");
        break;

      default:
        break;
    }

    return Promise.reject(error);
  }
);

export default API;