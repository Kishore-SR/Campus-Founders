import axios from "axios";

// Use explicit URL for production to avoid environment variable issues
const API_URL =
  import.meta.env.MODE === "production"
    ? "https://campus-founders-backend.vercel.app/api"
    : import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

// Log API URL for debugging (only in development)
if (import.meta.env.MODE !== "production") {
  console.log("🌐 API Base URL:", API_URL);
}

console.log("Using API URL:", API_URL); // Debug log

export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send cookies with requests
});

// Add interceptor to set Authorization header with token from localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to save token from login/signup responses
axiosInstance.interceptors.response.use(
  (response) => {
    // Save token if it exists in the response
    if (response.data && response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response;
  },
  (error) => {
    // Handle 401 errors - clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Only redirect if not already on login/signup page
      if (
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/signup")
      ) {
        // Don't redirect automatically - let the app handle it
        console.log("Unauthorized - token cleared");
      }
    }
    return Promise.reject(error);
  }
);
