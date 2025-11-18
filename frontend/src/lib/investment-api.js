import { axiosInstance } from "./axios";

// Create investment commitment
export const createInvestment = async (startupId, investmentData) => {
  const response = await axiosInstance.post(
    `/investments/${startupId}`,
    investmentData
  );
  return response.data;
};

// Get my investments (as investor)
export const getMyInvestments = async () => {
  const response = await axiosInstance.get("/investments/my-investments");
  return response.data;
};

// Get investments for a startup (as founder)
export const getStartupInvestments = async (startupId) => {
  const response = await axiosInstance.get(`/investments/startup/${startupId}`);
  return response.data;
};

// Update investment status
export const updateInvestmentStatus = async (investmentId, status) => {
  const response = await axiosInstance.put(
    `/investments/${investmentId}/status`,
    { status }
  );
  return response.data;
};
