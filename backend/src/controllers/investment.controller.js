import Investment from "../models/Investment.js";
import Startup from "../models/Startup.js";
import User from "../models/User.js";

// Create investment commitment
export async function createInvestment(req, res) {
  try {
    const investorId = req.user._id;
    const { startupId } = req.params;
    const {
      amount,
      milestone,
      message,
      deadlineStartDate,
      deadlineEndDate,
      deadlineTime,
    } = req.body;

    // Check if investor
    if (req.user.role !== "investor") {
      return res
        .status(403)
        .json({ message: "Only investors can make investments" });
    }

    // Check if investor is approved
    if (req.user.investorApprovalStatus !== "approved") {
      return res
        .status(403)
        .json({ message: "Your investor profile is not yet verified" });
    }

    // Check if startup exists
    const startup = await Startup.findById(startupId);
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }

    // Check if startup is approved
    if (startup.status !== "approved") {
      return res
        .status(400)
        .json({ message: "Can only invest in approved startups" });
    }

    // Create investment
    const investment = await Investment.create({
      investor: investorId,
      startup: startupId,
      amount: parseFloat(amount),
      milestone: milestone || "",
      message: message || "",
      deadlineStartDate: deadlineStartDate
        ? new Date(deadlineStartDate)
        : undefined,
      deadlineEndDate: deadlineEndDate ? new Date(deadlineEndDate) : undefined,
      deadlineTime: deadlineTime || "",
      status: "pending",
    });

    const populatedInvestment = await Investment.findById(investment._id)
      .populate("investor", "username fullName profilePic firm")
      .populate("startup", "name logo");

    res.status(201).json({
      message: "Investment commitment created successfully",
      investment: populatedInvestment,
    });
  } catch (error) {
    console.error("Error in createInvestment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get my investments (as investor)
export async function getMyInvestments(req, res) {
  try {
    const investorId = req.user._id;

    const investments = await Investment.find({ investor: investorId })
      .populate("startup", "name logo tagline stage category")
      .sort({ createdAt: -1 });

    res.status(200).json(investments);
  } catch (error) {
    console.error("Error in getMyInvestments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get investments for a startup (as founder)
export async function getStartupInvestments(req, res) {
  try {
    const { startupId } = req.params;

    // Check if user owns this startup
    const startup = await Startup.findById(startupId);
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }

    if (startup.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only view investments for your own startup",
      });
    }

    const investments = await Investment.find({ startup: startupId })
      .populate("investor", "username fullName profilePic firm investorRole")
      .sort({ createdAt: -1 });

    const totalCommitted = investments
      .filter((inv) => inv.status === "committed")
      .reduce((sum, inv) => sum + inv.amount, 0);

    const totalPending = investments
      .filter((inv) => inv.status === "pending")
      .reduce((sum, inv) => sum + inv.amount, 0);

    // Count unique investors (not total investments)
    const uniqueInvestorIds = new Set(
      investments
        .map((inv) => {
          const investorId = inv.investor?._id || inv.investor;
          return investorId?.toString();
        })
        .filter(Boolean)
    );
    const uniqueInvestorsCount = uniqueInvestorIds.size;

    res.status(200).json({
      investments,
      stats: {
        total: uniqueInvestorsCount,
        totalCommitted,
        totalPending,
      },
    });
  } catch (error) {
    console.error("Error in getStartupInvestments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Update investment status (founder can accept/reject)
export async function updateInvestmentStatus(req, res) {
  try {
    const { investmentId } = req.params;
    const { status } = req.body;

    const investment = await Investment.findById(investmentId).populate(
      "startup"
    );

    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }

    // Check if user owns this startup
    if (investment.startup.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only update investments for your own startup",
      });
    }

    investment.status = status;
    await investment.save();

    const populatedInvestment = await Investment.findById(investment._id)
      .populate("investor", "username fullName profilePic firm")
      .populate("startup", "name logo");

    res.status(200).json({
      message: "Investment status updated",
      investment: populatedInvestment,
    });
  } catch (error) {
    console.error("Error in updateInvestmentStatus:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
