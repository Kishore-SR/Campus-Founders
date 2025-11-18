import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  acceptFriendRequest,
  getFriendRequests,
  getMyFriends,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  sendFriendRequest,
  getApprovedInvestors,
  updateProfile,
  purchasePremium,
} from "../controllers/user.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", protectRoute, getRecommendedUsers);
router.get("/friends", protectRoute, getMyFriends);
router.get("/investors", protectRoute, getApprovedInvestors); // Get approved investors

router.put("/profile", updateProfile); // Update user profile
router.post("/premium/purchase", purchasePremium); // Purchase premium subscription

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest); //put req because we need to update the friend request

router.get("/friend-request", getFriendRequests); //get all friend requests

router.get("/outgoing-friend-request", getOutgoingFriendReqs); //get all outgoing friend requests to change the btn display

export default router;
