import express from "express";
import {
  upsertStartup,
  submitStartupForApproval,
  getMyStartup,
  getApprovedStartups,
  getStartupById,
  toggleUpvote,
  addReview,
  updateStartupMetrics,
  getAIRecommendations,
  semanticSearchStartups,
  summarizeStartupDescription,
  getInvestmentPotential,
  chatbotQuery,
  analyzeTextSentiment,
} from "../controllers/startup.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protected routes (require authentication)
router.post("/", protectRoute, upsertStartup); // Create or update startup
router.post("/submit", protectRoute, submitStartupForApproval); // Submit for approval
router.get("/my-startup", protectRoute, getMyStartup); // Get my startup
router.put("/metrics", protectRoute, updateStartupMetrics); // Update metrics

// AI-Powered routes (must be before /:id routes)
router.get("/ai/recommendations", protectRoute, getAIRecommendations); // AI recommendations for investors
router.get("/ai/search", semanticSearchStartups); // AI semantic search (public)
router.post("/ai/chatbot", protectRoute, chatbotQuery); // AI chatbot (protected - needs user for recommendations)
router.post("/ai/sentiment", analyzeTextSentiment); // Analyze sentiment (public)

// Public routes
router.get("/", getApprovedStartups); // Get all approved startups

// Routes with :id parameter (must be after specific routes)
router.get("/:id/ai/summary", summarizeStartupDescription); // AI summary (public)
router.get("/:id/ai/potential", getInvestmentPotential); // Investment potential (public)
router.post("/:id/upvote", protectRoute, toggleUpvote); // Toggle upvote
router.post("/:id/review", protectRoute, addReview); // Add/update review
router.get("/:id", getStartupById); // Get startup by ID

export default router;
