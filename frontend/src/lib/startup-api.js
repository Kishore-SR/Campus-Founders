import { axiosInstance } from "./axios";

// Get my startup
export const getMyStartup = async () => {
  const response = await axiosInstance.get("/startups/my-startup");
  return response.data;
};

// Create or update startup
export const upsertStartup = async (startupData) => {
  const response = await axiosInstance.post("/startups", startupData);
  return response.data;
};

// Submit startup for approval
export const submitStartupForApproval = async () => {
  const response = await axiosInstance.post("/startups/submit");
  return response.data;
};

// Get all approved startups
export const getApprovedStartups = async (params = {}) => {
  const response = await axiosInstance.get("/startups", { params });
  return response.data;
};

// Get startup by ID
export const getStartupById = async (id) => {
  const response = await axiosInstance.get(`/startups/${id}`);
  return response.data;
};

// Toggle upvote
export const toggleUpvote = async (id) => {
  const response = await axiosInstance.post(`/startups/${id}/upvote`);
  return response.data;
};

// Add review
export const addReview = async (id, reviewData) => {
  const response = await axiosInstance.post(
    `/startups/${id}/review`,
    reviewData
  );
  return response.data;
};

// Update startup metrics
export const updateStartupMetrics = async (metricsData) => {
  const response = await axiosInstance.put("/startups/metrics", metricsData);
  return response.data;
};

// AI-Powered: Get personalized recommendations (for investors)
export const getAIRecommendations = async () => {
  const response = await axiosInstance.get("/startups/ai/recommendations");
  return response.data;
};

// AI-Powered: Semantic search
export const semanticSearchStartups = async (query) => {
  const response = await axiosInstance.get("/startups/ai/search", {
    params: { query },
  });
  return response.data;
};

// AI-Powered: Get startup summary
export const getStartupSummary = async (id, maxSentences = 2) => {
  const response = await axiosInstance.get(`/startups/${id}/ai/summary`, {
    params: { maxSentences },
  });
  return response.data;
};

// AI-Powered: Get investment potential
export const getInvestmentPotential = async (id) => {
  const response = await axiosInstance.get(`/startups/${id}/ai/potential`);
  return response.data;
};

// AI-Powered: Chatbot query
export const chatbotQuery = async (query) => {
  const response = await axiosInstance.post("/startups/ai/chatbot", { query });
  return response.data;
};

// AI-Powered: Analyze sentiment
export const analyzeSentiment = async (text) => {
  const response = await axiosInstance.post("/startups/ai/sentiment", { text });
  return response.data;
};
