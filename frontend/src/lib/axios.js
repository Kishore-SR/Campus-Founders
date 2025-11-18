import axios from "axios";

// Use explicit URL for production to avoid environment variable issues
const API_URL =
  import.meta.env.MODE === "production"
    ? "https://campus-founders-backend.vercel.app/api"
    : import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

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
  (error) => Promise.reject(error)
);
