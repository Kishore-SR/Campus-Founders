import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema(
  {
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Startup",
      required: true,
    },
    amount: {
      type: Number,
      required: true, // In INR
    },
    unlocked: {
      type: Number,
      default: 0, // Amount unlocked so far
    },
    status: {
      type: String,
      enum: [
        "pending",
        "committed",
        "rejected",
        "active",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    milestone: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      default: "",
    },
    deadlineStartDate: {
      type: Date,
    },
    deadlineEndDate: {
      type: Date,
    },
    deadlineTime: {
      type: String, // Store time as string (HH:MM format)
      default: "",
    },
    milestones: [
      {
        title: String,
        amount: Number,
        progressRequired: Number, // Percentage
        unlocked: {
          type: Boolean,
          default: false,
        },
        unlockedAt: Date,
      },
    ],
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

investmentSchema.index({ investor: 1, startup: 1 });

const Investment = mongoose.model("Investment", investmentSchema);

export default Investment;
