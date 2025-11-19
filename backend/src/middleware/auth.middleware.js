import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    // Check if JWT_SECRET_KEY exists
    if (!process.env.JWT_SECRET_KEY) {
      console.error("❌ JWT_SECRET_KEY is missing in environment variables");
      return res.status(500).json({
        message: "Server configuration error - Missing JWT_SECRET_KEY",
        error: "ENV_VAR_MISSING",
      });
    }

    // Ensure database connection (for serverless environments)
    const mongoose = (await import("mongoose")).default;
    if (mongoose.connection.readyState !== 1) {
      const { connectDB } = await import("../lib/db.js");
      try {
        await connectDB();
      } catch (dbError) {
        console.error(
          "Failed to connect to database in protectRoute:",
          dbError
        );
        return res.status(500).json({
          message: "Database connection error",
          error: "DB_CONNECTION_FAILED",
        });
      }
    }

    // Try to get token from cookie first
    let token = req.cookies.jwt;

    // If no cookie token, check Authorization header
    if (
      !token &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Error in protectRoute middleware:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // Handle specific JWT errors
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Unauthorized - Invalid token format",
        error: "INVALID_TOKEN",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Unauthorized - Token expired",
        error: "TOKEN_EXPIRED",
      });
    }

    if (error.name === "NotBeforeError") {
      return res.status(401).json({
        message: "Unauthorized - Token not active",
        error: "TOKEN_NOT_ACTIVE",
      });
    }

    // Handle database connection errors
    if (error.name === "MongooseError" || error.name === "MongoError") {
      console.error("💾 Database connection error in protectRoute");
      return res.status(500).json({
        message: "Database connection error",
        error: "DB_CONNECTION_ERROR",
      });
    }

    // Generic error response
    res.status(500).json({
      message: "Internal server error in authentication",
      error: "AUTH_MIDDLEWARE_ERROR",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Optional auth middleware - doesn't fail if no token, just sets req.user to null
export const optionalAuth = async (req, res, next) => {
  try {
    // Check if JWT_SECRET_KEY exists
    if (!process.env.JWT_SECRET_KEY) {
      req.user = null;
      return next();
    }

    // Ensure database connection (for serverless environments)
    const mongoose = (await import("mongoose")).default;
    if (mongoose.connection.readyState !== 1) {
      const { connectDB } = await import("../lib/db.js");
      try {
        await connectDB();
      } catch (dbError) {
        console.error(
          "Failed to connect to database in optionalAuth:",
          dbError
        );
        req.user = null;
        return next();
      }
    }

    // Try to get token from cookie first
    let token = req.cookies.jwt;

    // If no cookie token, check Authorization header
    if (
      !token &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      if (decoded) {
        const user = await User.findById(decoded.userId).select("-password");
        req.user = user || null;
      } else {
        req.user = null;
      }
    } catch (error) {
      // If token is invalid/expired, just continue without user
      req.user = null;
    }

    next();
  } catch (error) {
    // On any error, just continue without user
    req.user = null;
    next();
  }
};
