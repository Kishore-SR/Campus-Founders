import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Startup",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    // AI-generated sentiment analysis
    sentimentScore: {
      type: Number,
      default: 0,
      min: -1,
      max: 1,
    },
    sentimentLabel: {
      type: String,
      enum: ["positive", "negative", "neutral"],
      default: "neutral",
    },
  },
  { timestamps: true }
);

// One review per user per startup
reviewSchema.index({ startup: 1, user: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
