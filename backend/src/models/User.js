import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: false,
      trim: true,
      default: "", // Making it optional
      maxlength: 50,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 20,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    bio: {
      type: String,
      default: "",
    },
    profilePic: {
      type: String,
      default: "",
    },
    nativeLanguage: {
      type: String,
      default: "",
    },
    learningLanguage: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["student", "investor", "normal", "admin"],
      default: "normal",
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    // Investor-specific approval
    investorApprovalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: function () {
        return this.role === "investor" ? "pending" : "approved";
      },
    },
    investorRejectionReason: {
      type: String,
      default: "",
    },
    // Investor-specific fields
    firm: {
      type: String,
      default: "",
    },
    investorRole: {
      type: String,
      default: "",
    },
    ticketSize: {
      type: String,
      default: "",
    },
    investmentDomains: [String],
    linkedinUrl: {
      type: String,
      default: "",
    },
    previousInvestments: {
      type: String,
      default: "",
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isPremium: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

//Pre hook - to hash the passwords of the users in database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(6);
    this.password = await bcrypt.hash(this.password, salt);

    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  const isPasswordCorrect = await bcrypt.compare(
    enteredPassword,
    this.password
  );
  return isPasswordCorrect;
};

const User = mongoose.model("User", userSchema);

export default User;
