import mongoose from "mongoose";

const startupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    tagline: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "fintech",
        "healthtech",
        "edtech",
        "agritech",
        "e-commerce",
        "saas",
        "ai/ml",
        "iot",
        "blockchain",
        "climatetech",
        "proptech",
        "foodtech",
        "traveltech",
        "gaming",
        "social media",
        "media & entertainment",
        "logistics",
        "hr tech",
        "legaltech",
        "other",
      ],
    },
    stage: {
      type: String,
      required: true,
      enum: ["idea", "prototype", "mvp", "beta", "launched", "growth"],
      default: "idea",
    },
    logo: {
      type: String,
      default: "",
    },
    screenshots: [
      {
        type: String,
      },
    ],
    websiteUrl: {
      type: String,
      default: "",
    },
    demoUrl: {
      type: String,
      default: "",
    },
    // Owner (Student Founder)
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Team members
    team: [
      {
        name: String,
        designation: String,
        linkedinUrl: String,
      },
    ],
    // Company Registration Details
    mobileNumber: {
      type: String,
      default: "",
      trim: true,
    },
    companyRegisteredLocation: {
      type: String,
      default: "",
      trim: true,
    },
    companyType: {
      type: String,
      enum: [
        "startup",
        "msme",
        "llp",
        "private limited",
        "public limited",
        "partnership",
        "sole proprietorship",
        "other",
      ],
      default: "startup",
    },
    fundingRound: {
      type: String,
      enum: [
        "pre-seed",
        "seed",
        "series a",
        "series b",
        "series c",
        "series d+",
        "bootstrapped",
        "not funded",
      ],
      default: "not funded",
    },
    numberOfEmployees: {
      type: Number,
      default: 0,
      min: 0,
    },
    companyContactInfo: {
      email: {
        type: String,
        default: "",
        trim: true,
      },
      phone: {
        type: String,
        default: "",
        trim: true,
      },
      address: {
        type: String,
        default: "",
        trim: true,
      },
    },
    // Metrics
    revenue: {
      type: Number,
      default: 0, // In INR
    },
    users: {
      type: Number,
      default: 0,
    },
    // Roadmap & Progress
    roadmap: [
      {
        title: String,
        type: {
          type: String,
          enum: [
            "development",
            "testing",
            "launch",
            "beta",
            "marketing",
            "other",
          ],
        },
        progress: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
        startDate: Date,
        endDate: Date,
      },
    ],
    // Approval status
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected"],
      default: "draft",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    // University info
    university: {
      type: String,
      default: "",
    },
    // Engagement
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    upvoteCount: {
      type: Number,
      default: 0,
    },
    // AI-generated tags
    aiTags: [String],
    // AI investment prediction
    investmentPotential: {
      score: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      prediction: {
        type: String,
        enum: ["high", "medium", "low"],
        default: "low",
      },
    },
  },
  { timestamps: true }
);

// Index for faster queries
startupSchema.index({ owner: 1 });
startupSchema.index({ status: 1 });
startupSchema.index({ category: 1 });

const Startup = mongoose.model("Startup", startupSchema);

export default Startup;
