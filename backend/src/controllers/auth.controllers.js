import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { upsertStreamUser } from "../lib/stream.js";

export async function signup(req, res) {
  const { email, password, username, fullName, role } = req.body;

  try {
    // Check if JWT_SECRET_KEY exists
    if (!process.env.JWT_SECRET_KEY) {
      console.error("JWT_SECRET_KEY is missing in environment variables");
      return res.status(500).json({
        message: "Server configuration error",
        error: "ENV_VAR_MISSING",
      });
    }

    if (!email || !password || !username) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    // Validate role if provided
    if (role && !["student", "investor", "normal"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Must be student, investor, or normal",
      });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already exists, please use different mail" });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res
        .status(400)
        .json({ message: "Username already taken, please try another one" });
    }

    const newUser = await User.create({
      email,
      password,
      username,
      fullName: fullName || "", // Include fullName if provided
      profilePic: "", // Profile pic will be set during onboarding
      role: role || "normal", // Default to 'normal' if not provided
    });

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName || username,
        image: newUser.profilePic || "",
      });
      console.log(`Stream user created for "@${newUser.username}"`);
    } catch (error) {
      console.error("Error creating/updating Stream user:", error);
    }
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "12d",
      }
    );

    // Send cookie with proper settings for cross-domain
    res.cookie("jwt", token, {
      maxAge: 12 * 24 * 60 * 60 * 1000, // 12 days
      httpOnly: true,
      secure: true, // Always use secure for Vercel deployment
      sameSite: "none", // Required for cross-domain cookies
      path: "/",
    });

    // Also send token in response for client-side storage if needed
    res.status(201).json({ success: true, user: newUser, token });
  } catch (error) {
    console.log("Error in signup controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function login(req, res) {
  try {
    // Check if JWT_SECRET_KEY exists
    if (!process.env.JWT_SECRET_KEY) {
      console.error("JWT_SECRET_KEY is missing in environment variables");
      return res.status(500).json({
        message: "Server configuration error",
        error: "ENV_VAR_MISSING",
      });
    }

    // Ensure database connection (for serverless environments)
    const mongoose = (await import("mongoose")).default;
    if (mongoose.connection.readyState !== 1) {
      console.log("Database not connected. Attempting to connect...");
      const { connectDB } = await import("../lib/db.js");
      try {
        await connectDB();
        console.log("Database connected successfully");
      } catch (dbError) {
        console.error("Failed to connect to database:", dbError);
        console.error("Error details:", {
          name: dbError.name,
          message: dbError.message,
          stack: dbError.stack,
        });
        return res.status(500).json({
          message: "Database connection error",
          error: "DB_CONNECTION_FAILED",
          details:
            process.env.NODE_ENV === "development"
              ? dbError.message
              : undefined,
        });
      }
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    } // Create JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "12d",
    });

    // Send cookie with proper settings for cross-domain
    res.cookie("jwt", token, {
      maxAge: 12 * 24 * 60 * 60 * 1000, // 12 days
      httpOnly: true,
      secure: true, // Always use secure for Vercel deployment
      sameSite: "none", // Required for cross-domain cookies
      path: "/",
    });

    // Also send token in response for client-side storage if needed
    res.status(200).json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Internal server error",
      error: error.message || "Unknown error",
      type: error.name || "Error",
    });
  }
}

export function logout(req, res) {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: true, // Always use secure for Vercel deployment
    sameSite: "none", // Required for cross-domain cookies
    path: "/",
  });
  res.status(200).json({ message: "Logout successful" });
}

export async function onboard(req, res) {
  try {
    const userId = req.user._id;

    const {
      bio,
      nativeLanguage,
      learningLanguage,
      location,
      role,
      profilePic,
    } = req.body;

    // Required fields: bio, interestedDomain (nativeLanguage), location, and profilePic
    if (!bio || !nativeLanguage || !location || !profilePic) {
      return res.status(400).json({
        message: "All required fields must be filled including profile picture",
        missingFields: [
          !bio && "bio",
          !nativeLanguage && "interestedDomain",
          !location && "location",
          !profilePic && "profilePic",
        ].filter(Boolean),
      });
    }

    // Validate profilePic format if provided
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

    // Validate role if provided
    if (role && !["student", "investor", "normal"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Must be student, investor, or normal",
      });
    }

    const updateData = {
      bio: bio.trim(),
      nativeLanguage: nativeLanguage.trim(),
      learningLanguage: learningLanguage?.trim() || "",
      location: location.trim(),
      profilePic: profilePic.trim(),
      isOnboarded: true,
    };

    if (role) {
      updateData.role = role;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName || updatedUser.username,
        image: updatedUser.profilePic || "",
      });
      console.log(`Stream user updated for "@${updatedUser.username}"`);
    } catch (error) {
      console.error("Error creating/updating Stream user:", error.message);
    }

    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.log("Onboarding error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Add this new function to check if a username exists
export async function checkUsername(req, res) {
  const { username } = req.params;

  try {
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      // Return 409 Conflict if username exists
      return res.status(409).json({
        message: "Username already exists",
        exists: true,
      });
    }

    // Return 200 OK if username is available
    return res.status(200).json({
      message: "Username is available",
      exists: false,
    });
  } catch (error) {
    console.error("Error checking username:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
