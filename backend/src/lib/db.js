import mongoose from "mongoose";

// Cache the connection promise to avoid multiple connection attempts
let connectionPromise = null;

export const connectDB = async () => {
  // If already connected, return immediately
  if (mongoose.connection.readyState === 1) {
    console.log("✅ MongoDB already connected");
    return mongoose.connection;
  }

  // If connection is in progress, wait for it
  if (connectionPromise) {
    console.log("⏳ Waiting for existing connection attempt...");
    return connectionPromise;
  }

  // Start new connection
  connectionPromise = (async () => {
    try {
      // Check if MONGODB_URI is properly set
      if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI environment variable is not defined");
      }

      // Log a sanitized version of the connection string for debugging
      const uri = process.env.MONGODB_URI.trim(); // Trim any whitespace

      // Try to detect common issues with the MongoDB URI
      console.log(`MongoDB URI inspection:`);
      console.log(`- Length: ${uri.length} characters`);
      console.log(`- First 5 chars: "${uri.substring(0, 5)}"`);
      console.log(`- Contains 'mongodb': ${uri.includes("mongodb")}`);
      console.log(`- Contains '@': ${uri.includes("@")}`);

      // Attempt to fix common issues with the URI
      let cleanedUri = uri;

      // If URI is wrapped in quotes (sometimes happens with env vars)
      if (
        (uri.startsWith('"') && uri.endsWith('"')) ||
        (uri.startsWith("'") && uri.endsWith("'"))
      ) {
        cleanedUri = uri.substring(1, uri.length - 1);
        console.log(`⚠️ Removed quotes from MongoDB URI`);
      }

      // If the URI lacks the mongodb:// prefix but has something like mongodb.net
      if (
        !cleanedUri.startsWith("mongodb://") &&
        !cleanedUri.startsWith("mongodb+srv://") &&
        (cleanedUri.includes("mongodb.net") || cleanedUri.includes("mongo"))
      ) {
        if (!cleanedUri.includes("://")) {
          cleanedUri = `mongodb+srv://${cleanedUri}`;
          console.log(`⚠️ Added missing protocol prefix to MongoDB URI`);
        }
      }

      const sanitizedUri = cleanedUri.replace(
        /\/\/([^:]+):([^@]+)@/,
        "//[username]:[password]@"
      );
      console.log(
        `Attempting to connect to MongoDB with URI pattern: ${sanitizedUri}`
      );

      // Validate the URI format
      if (
        !cleanedUri.startsWith("mongodb://") &&
        !cleanedUri.startsWith("mongodb+srv://")
      ) {
        throw new Error(
          `Invalid MongoDB URI scheme. URI must start with "mongodb://" or "mongodb+srv://". Received: ${cleanedUri.substring(
            0,
            10
          )}...`
        );
      }

      // Set mongoose options for better reliability
      const options = {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        connectTimeoutMS: 10000, // Give up initial connection after 10s
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        family: 4, // Use IPv4, skip trying IPv6
      };

      const conn = await mongoose.connect(cleanedUri, options);
      console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
      connectionPromise = null; // Reset on success
      return conn;
    } catch (error) {
      connectionPromise = null; // Reset on error so we can retry
      console.error("❌ MongoDB connection error:", error);
      console.error("Error type:", error.name);
      console.error("Error message:", error.message);

      // Provide more helpful diagnostics based on error type
      if (error.name === "MongoParseError") {
        console.error(
          "This is likely due to an invalid connection string format."
        );
        console.error("Please check your MONGODB_URI environment variable.");
      } else if (error.name === "MongoServerSelectionError") {
        console.error("Cannot reach MongoDB server. Possible causes:");
        console.error("- Network connectivity issues");
        console.error("- MongoDB server is down");
        console.error("- IP address not whitelisted in MongoDB Atlas");
      }

      // Don't exit the process in production/serverless environment
      if (process.env.NODE_ENV !== "production") {
        console.error(
          "Exiting due to MongoDB connection failure (development mode)"
        );
        process.exit(1); // Only exit in development
      } else {
        console.error(
          "MongoDB connection failed but continuing execution (production mode)"
        );
      }

      throw error; // Re-throw the error for handling upstream
    }
  })();

  return connectionPromise;
};
