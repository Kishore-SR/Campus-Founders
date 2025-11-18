import express from "express";
import {
  adminLogin,
  getAllUsers,
  getAllStartups,
  approveStartup,
  rejectStartup,
  getAllInvestors,
  approveInvestor,
  rejectInvestor,
  getDashboardStats,
  deleteUser,
} from "../controllers/admin.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

// Admin login (no auth required)
router.post("/login", adminLogin);

// Protected admin routes
router.get("/stats", protectRoute, requireAdmin, getDashboardStats);
router.get("/users", protectRoute, requireAdmin, getAllUsers);
router.get("/startups", protectRoute, requireAdmin, getAllStartups);
router.put("/startups/:id/approve", protectRoute, requireAdmin, approveStartup);
router.put("/startups/:id/reject", protectRoute, requireAdmin, rejectStartup);
router.get("/investors", protectRoute, requireAdmin, getAllInvestors);
router.put(
  "/investors/:id/approve",
  protectRoute,
  requireAdmin,
  approveInvestor
);
router.put("/investors/:id/reject", protectRoute, requireAdmin, rejectInvestor);
router.delete("/users/:id", protectRoute, requireAdmin, deleteUser);

export default router;
