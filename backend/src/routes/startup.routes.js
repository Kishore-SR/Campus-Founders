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
import { protectRoute, optionalAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protected routes (require authentication)
router.post("/", protectRoute, upsertStartup); // Create or update startup
router.post("/submit", protectRoute, submitStartupForApproval); // Submit for approval
router.get("/my-startup", protectRoute, getMyStartup); // Get my startup
router.put("/metrics", protectRoute, updateStartupMetrics); // Update metrics

// AI-Powered routes (must be before /:id routes)
router.get("/ai/recommendations", protectRoute, getAIRecommendations); // AI recommendations for investors
router.get("/ai/search", optionalAuth, semanticSearchStartups); // AI semantic search (optional auth for compatibility scores)
router.post("/ai/chatbot", protectRoute, chatbotQuery); // AI chatbot (protected - needs user for recommendations)
router.post("/ai/sentiment", analyzeTextSentiment); // Analyze sentiment (public)

// Public routes (but can optionally use auth for investor features)
router.get("/", optionalAuth, getApprovedStartups); // Get all approved startups (optional auth for compatibility scores)

// Routes with :id parameter (must be after specific routes)
router.get("/:id/ai/summary", summarizeStartupDescription); // AI summary (public)
router.get("/:id/ai/potential", getInvestmentPotential); // Investment potential (public)
router.post("/:id/upvote", protectRoute, toggleUpvote); // Toggle upvote
router.post("/:id/review", protectRoute, addReview); // Add/update review
router.get("/:id", optionalAuth, getStartupById); // Get startup by ID (optional auth for compatibility scores)

export default router;
