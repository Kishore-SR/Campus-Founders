import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;

    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, //exclude current user
        { _id: { $nin: currentUser.friends } }, // exclude current user's friends
        { isOnboarded: true },
      ],
    });
    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in getRecommendedUsers controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate(
        "friends",
        "username fullName profilePic nativeLanguage learningLanguage bio role location"
      );

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getMyFriends controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    // prevent sending req to yourself
    if (myId === recipientId) {
      return res
        .status(400)
        .json({ message: "You can't send friend request to yourself" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // check if user is already friends
    if (recipient.friends.includes(myId)) {
      return res
        .status(400)
        .json({ message: "You are already friends with this user" });
    }

    // check if a req already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "A friend request already exists between you and this user",
      });
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Verify the current user is the recipient
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to accept this request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    // add each user to the other's friends array
    // $addToSet: adds elements to an array only if they do not already exist.
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log("Error in acceptFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFriendRequests(req, res) {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate(
      "sender",
      "username fullName profilePic nativeLanguage learningLanguage bio role location"
    );

    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate(
      "recipient",
      "username fullName profilePic nativeLanguage learningLanguage bio role location"
    );

    res.status(200).json({ incomingReqs, acceptedReqs });
  } catch (error) {
    console.log("Error in getPendingFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getOutgoingFriendReqs(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate(
      "recipient",
      "username fullName profilePic nativeLanguage learningLanguage bio role location"
    );

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getApprovedInvestors(req, res) {
  try {
    const investors = await User.find({
      role: "investor",
      investorApprovalStatus: "approved",
      isOnboarded: true,
    }).select("-password");

    res.status(200).json(investors);
  } catch (error) {
    console.log("Error in getApprovedInvestors controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Update user profile
export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      fullName,
      bio,
      profilePic,
      // Investor-specific fields
      firm,
      investorRole,
      ticketSize,
      investmentDomains,
      linkedinUrl,
      previousInvestments,
    } = req.body;

    // Validate that profilePic is a valid data URL if provided
    if (
      profilePic &&
      !profilePic.startsWith("data:image/") &&
      !profilePic.startsWith("http")
    ) {
      return res.status(400).json({
        message:
          "Invalid profile picture format. Must be a data URL or HTTP URL",
      });
    }

    // Validate previousInvestments is a valid URL if provided
    if (
      previousInvestments &&
      !previousInvestments.startsWith("http") &&
      !previousInvestments.startsWith("https") &&
      previousInvestments.trim() !== ""
    ) {
      return res.status(400).json({
        message:
          "Previous investments must be a valid URL (e.g., Google Drive link)",
      });
    }

    // Validate linkedinUrl is a valid URL if provided
    if (
      linkedinUrl &&
      !linkedinUrl.startsWith("http") &&
      !linkedinUrl.startsWith("https") &&
      linkedinUrl.trim() !== ""
    ) {
      return res.status(400).json({
        message: "LinkedIn URL must be a valid URL",
      });
    }

    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName.trim();
    if (bio !== undefined) updateData.bio = bio.trim();
    if (profilePic !== undefined) updateData.profilePic = profilePic;

    // Only update investor fields if user is an investor
    if (user.role === "investor") {
      if (firm !== undefined) updateData.firm = firm.trim();
      if (investorRole !== undefined)
        updateData.investorRole = investorRole.trim();
      if (ticketSize !== undefined) updateData.ticketSize = ticketSize.trim();
      if (investmentDomains !== undefined) {
        // Ensure it's an array and filter out empty strings
        updateData.investmentDomains = Array.isArray(investmentDomains)
          ? investmentDomains.filter((domain) => domain && domain.trim() !== "")
          : [];
      }
      if (linkedinUrl !== undefined)
        updateData.linkedinUrl = linkedinUrl.trim();
      if (previousInvestments !== undefined)
        updateData.previousInvestments = previousInvestments.trim();
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update Stream user
    try {
      const { upsertStreamUser } = await import("../lib/stream.js");
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName || updatedUser.username,
        image: updatedUser.profilePic || "",
      });
      console.log(`Stream user updated for "@${updatedUser.username}"`);
    } catch (error) {
      console.error("Error updating Stream user:", error.message);
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateProfile controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Purchase premium subscription
export async function purchasePremium(req, res) {
  try {
    const userId = req.user.id;

    // Simulate payment processing (in production, integrate with payment gateway)
    // For now, we'll just update the user's premium status
    const user = await User.findByIdAndUpdate(
      userId,
      { isPremium: true },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Premium subscription activated successfully",
      user: user,
    });
  } catch (error) {
    console.error("Error in purchasePremium controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
