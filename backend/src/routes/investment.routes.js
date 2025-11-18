import express from "express";
import {
  createInvestment,
  getMyInvestments,
  getStartupInvestments,
  updateInvestmentStatus,
} from "../controllers/investment.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

// Create investment commitment
router.post("/:startupId", createInvestment);

// Get my investments (as investor)
router.get("/my-investments", getMyInvestments);

// Get investments for a startup (as founder)
router.get("/startup/:startupId", getStartupInvestments);

// Update investment status
router.put("/:investmentId/status", updateInvestmentStatus);

export default router;
