import { axiosInstance } from "./axios";

// Admin login
export const adminLogin = async (credentials) => {
  const response = await axiosInstance.post("/admin/login", credentials);
  return response.data;
};

// Get dashboard stats
export const getDashboardStats = async () => {
  const response = await axiosInstance.get("/admin/stats");
  return response.data;
};

// Get all users
export const getAllUsers = async () => {
  const response = await axiosInstance.get("/admin/users");
  return response.data;
};

// Get all startups (all statuses)
export const getAllStartups = async (params = {}) => {
  const response = await axiosInstance.get("/admin/startups", { params });
  return response.data;
};

// Approve startup
export const approveStartup = async (id) => {
  const response = await axiosInstance.put(`/admin/startups/${id}/approve`);
  return response.data;
};

// Reject startup
export const rejectStartup = async (id, reason) => {
  const response = await axiosInstance.put(`/admin/startups/${id}/reject`, {
    reason,
  });
  return response.data;
};

// Get all investors
export const getAllInvestors = async (params = {}) => {
  const response = await axiosInstance.get("/admin/investors", { params });
  return response.data;
};

// Approve investor
export const approveInvestor = async (id) => {
  const response = await axiosInstance.put(`/admin/investors/${id}/approve`);
  return response.data;
};

// Reject investor
export const rejectInvestor = async (id, reason) => {
  const response = await axiosInstance.put(`/admin/investors/${id}/reject`, {
    reason,
  });
  return response.data;
};

// Delete user completely
export const deleteUser = async (id, password) => {
  const response = await axiosInstance.delete(`/admin/users/${id}`, {
    data: { password },
  });
  return response.data;
};
