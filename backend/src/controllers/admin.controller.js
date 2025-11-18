import User from "../models/User.js";
import Startup from "../models/Startup.js";
import Investment from "../models/Investment.js";
import Review from "../models/Review.js";
import FriendRequest from "../models/FriendRequest.js";
import jwt from "jsonwebtoken";

// Admin login
export async function adminLogin(req, res) {
  try {
    const { username, password } = req.body;

    // Hardcoded admin credentials for demo
    if (username !== "cosmic" || password !== "123456") {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Find or create admin user
    let adminUser = await User.findOne({ username: "cosmic", role: "admin" });

    if (!adminUser) {
      // Create admin user
      adminUser = await User.create({
        username: "cosmic",
        email: "admin@campusfounders.com",
        password: "123456",
        fullName: "Admin",
        role: "admin",
        isOnboarded: true,
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: adminUser._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    // Send cookie
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    res.status(200).json({
      success: true,
      user: adminUser,
      token,
    });
  } catch (error) {
    console.error("Error in adminLogin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get all users with counts
export async function getAllUsers(req, res) {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("-password")
      .sort({ createdAt: -1 });

    const studentCount = users.filter((u) => u.role === "student").length;
    const investorCount = users.filter((u) => u.role === "investor").length;
    const normalCount = users.filter((u) => u.role === "normal").length;

    res.status(200).json({
      users,
      counts: {
        total: users.length,
        students: studentCount,
        investors: investorCount,
        normal: normalCount,
      },
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get all startups (all statuses)
export async function getAllStartups(req, res) {
  try {
    const { status } = req.query;

    const query = status ? { status } : {};

    const startups = await Startup.find(query)
      .populate("owner", "username fullName email profilePic")
      .sort({ createdAt: -1 });

    const counts = {
      total: await Startup.countDocuments(),
      pending: await Startup.countDocuments({ status: "pending" }),
      approved: await Startup.countDocuments({ status: "approved" }),
      rejected: await Startup.countDocuments({ status: "rejected" }),
      draft: await Startup.countDocuments({ status: "draft" }),
    };

    res.status(200).json({ startups, counts });
  } catch (error) {
    console.error("Error in getAllStartups:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Approve startup
export async function approveStartup(req, res) {
  try {
    const { id } = req.params;

    const startup = await Startup.findById(id);
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }

    startup.status = "approved";
    startup.rejectionReason = "";
    await startup.save();

    res.status(200).json({ message: "Startup approved", startup });
  } catch (error) {
    console.error("Error in approveStartup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Reject startup
export async function rejectStartup(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const startup = await Startup.findById(id);
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }

    startup.status = "rejected";
    startup.rejectionReason = reason || "Does not meet platform guidelines";
    await startup.save();

    res.status(200).json({ message: "Startup rejected", startup });
  } catch (error) {
    console.error("Error in rejectStartup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get all investors (for approval)
export async function getAllInvestors(req, res) {
  try {
    const { status } = req.query;

    const query = { role: "investor" };
    if (status) {
      query.investorApprovalStatus = status;
    }

    const investors = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    const counts = {
      total: await User.countDocuments({ role: "investor" }),
      pending: await User.countDocuments({
        role: "investor",
        investorApprovalStatus: "pending",
      }),
      approved: await User.countDocuments({
        role: "investor",
        investorApprovalStatus: "approved",
      }),
      rejected: await User.countDocuments({
        role: "investor",
        investorApprovalStatus: "rejected",
      }),
    };

    res.status(200).json({ investors, counts });
  } catch (error) {
    console.error("Error in getAllInvestors:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Approve investor
export async function approveInvestor(req, res) {
  try {
    const { id } = req.params;

    const investor = await User.findById(id);
    if (!investor || investor.role !== "investor") {
      return res.status(404).json({ message: "Investor not found" });
    }

    investor.investorApprovalStatus = "approved";
    await investor.save();

    res
      .status(200)
      .json({ message: "Investor verified and approved", investor });
  } catch (error) {
    console.error("Error in approveInvestor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Reject investor
export async function rejectInvestor(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const investor = await User.findById(id);
    if (!investor || investor.role !== "investor") {
      return res.status(404).json({ message: "Investor not found" });
    }

    investor.investorApprovalStatus = "rejected";
    investor.investorRejectionReason =
      reason || "Does not meet platform guidelines";
    await investor.save();

    res
      .status(200)
      .json({ message: "Investor verification rejected", investor });
  } catch (error) {
    console.error("Error in rejectInvestor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get dashboard stats
export async function getDashboardStats(req, res) {
  try {
    const stats = {
      users: {
        total: await User.countDocuments({ role: { $ne: "admin" } }),
        students: await User.countDocuments({ role: "student" }),
        investors: await User.countDocuments({ role: "investor" }),
        normal: await User.countDocuments({ role: "normal" }),
      },
      startups: {
        total: await Startup.countDocuments(),
        pending: await Startup.countDocuments({ status: "pending" }),
        approved: await Startup.countDocuments({ status: "approved" }),
        rejected: await Startup.countDocuments({ status: "rejected" }),
      },
      investors: {
        pending: await User.countDocuments({
          role: "investor",
          investorApprovalStatus: "pending",
        }),
        approved: await User.countDocuments({
          role: "investor",
          investorApprovalStatus: "approved",
        }),
      },
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Delete user completely (removes user and all related data)
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const { password } = req.body;

    // Verify password
    if (password !== "ksr") {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting admin users
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete admin users" });
    }

    // Delete all startups owned by this user
    await Startup.deleteMany({ owner: id });

    // Delete all investments where user is investor
    await Investment.deleteMany({ investor: id });

    // Delete all reviews by this user
    await Review.deleteMany({ user: id });

    // Delete all friend requests where user is sender or recipient
    await FriendRequest.deleteMany({
      $or: [{ sender: id }, { recipient: id }],
    });

    // Remove user from all other users' friends arrays
    await User.updateMany({ friends: id }, { $pull: { friends: id } });

    // Remove user from startup upvotes
    await Startup.updateMany({ upvotes: id }, { $pull: { upvotes: id } });

    // Finally, delete the user
    await User.findByIdAndDelete(id);

    res.status(200).json({
      message: "User and all related data deleted successfully",
      deletedUserId: id,
    });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
