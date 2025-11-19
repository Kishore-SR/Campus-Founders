import Startup from "../models/Startup.js";
import Review from "../models/Review.js";
import User from "../models/User.js";
import {
  findSimilarStartups,
  recommendStartupsForInvestor,
  summarizeText,
  calculateCompatibilityScore,
  analyzeSentiment,
  generateTags,
  predictInvestmentPotential,
  processChatbotQuery,
} from "../lib/ai-utils.js";

// Create or Update Startup (Student only, one startup per student)
export async function upsertStartup(req, res) {
  try {
    const userId = req.user._id;
    const user = req.user;

    // Check if user is a student
    if (user.role !== "student") {
      return res
        .status(403)
        .json({ message: "Only students can create startups" });
    }

    // Check if user already has a startup
    const existingStartup = await Startup.findOne({ owner: userId });

    const startupData = {
      ...req.body,
      owner: userId,
      university: user.location, // Pull from user profile
    };

    // Generate AI tags from description
    const descriptionText = `${startupData.name || ""} ${
      startupData.tagline || ""
    } ${startupData.description || ""}`;
    const aiTags = generateTags(descriptionText, 5);
    startupData.aiTags = aiTags;

    let startup;
    if (existingStartup) {
      // Update existing startup
      startup = await Startup.findByIdAndUpdate(
        existingStartup._id,
        startupData,
        {
          new: true,
          runValidators: true,
        }
      );
    } else {
      // Create new startup
      startup = await Startup.create(startupData);
    }

    // Calculate investment potential
    const investmentPotential = predictInvestmentPotential(startup);
    startup.investmentPotential = {
      score: investmentPotential.score,
      prediction: investmentPotential.prediction,
    };
    await startup.save();

    res.status(200).json({
      ...startup.toObject(),
      aiTags,
      investmentPotential: {
        score: investmentPotential.score,
        prediction: investmentPotential.prediction,
        recommendation: investmentPotential.recommendation,
        factors: investmentPotential.factors,
      },
    });
  } catch (error) {
    console.error("Error in upsertStartup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Submit startup for approval
export async function submitStartupForApproval(req, res) {
  try {
    const userId = req.user._id;

    const startup = await Startup.findOne({ owner: userId });
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }

    startup.status = "pending";
    await startup.save();

    res
      .status(200)
      .json({ message: "Startup submitted for approval", startup });
  } catch (error) {
    console.error("Error in submitStartupForApproval:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get my startup
export async function getMyStartup(req, res) {
  try {
    const userId = req.user._id;
    const startup = await Startup.findOne({ owner: userId });

    if (!startup) {
      return res.status(404).json({ message: "No startup found" });
    }

    // Get review stats
    const reviews = await Review.find({ startup: startup._id });
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.status(200).json({
      startup,
      stats: {
        upvotes: startup.upvoteCount,
        reviews: reviews.length,
        avgRating: avgRating.toFixed(1),
      },
    });
  } catch (error) {
    console.error("Error in getMyStartup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get all approved startups (public)
export async function getApprovedStartups(req, res) {
  try {
    const { category, search } = req.query;
    const user = req.user; // Get authenticated user if available

    const query = { status: "approved" };
    if (category) {
      query.category = category.toLowerCase();
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { tagline: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const startups = await Startup.find(query)
      .populate("owner", "username profilePic fullName location")
      .sort({ upvoteCount: -1, createdAt: -1 })
      .lean();

    // If user is an investor, add compatibility scores with randomization
    if (
      user &&
      user.role === "investor" &&
      user.investorApprovalStatus === "approved"
    ) {
      const startupsWithScores = startups.map((startup) => {
        const baseScore = calculateCompatibilityScore(user, startup);
        // Add randomization: +0 to +5 variation for better UI (80-85% range if base is around 80)
        const variation = Math.floor(Math.random() * 6); // 0 to +5
        const compatibilityScore = Math.min(
          100,
          Math.max(0, baseScore + variation)
        );
        return {
          ...startup,
          compatibilityScore,
        };
      });
      return res.status(200).json(startupsWithScores);
    }

    res.status(200).json(startups);
  } catch (error) {
    console.error("Error in getApprovedStartups:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get startup by ID
export async function getStartupById(req, res) {
  try {
    const { id } = req.params;

    const startup = await Startup.findById(id)
      .populate("owner", "username profilePic fullName location role")
      .populate("upvotes", "username profilePic");

    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }

    // Get reviews
    const reviews = await Review.find({ startup: id })
      .populate("user", "username profilePic fullName")
      .sort({ createdAt: -1 });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    // Calculate compatibility score for investors with randomization
    let compatibilityScore = undefined;
    if (
      req.user &&
      req.user.role === "investor" &&
      req.user.investorApprovalStatus === "approved"
    ) {
      const baseScore = calculateCompatibilityScore(req.user, startup);
      // Add randomization: +0 to +5 variation for better UI (80-85% range if base is around 80)
      const variation = Math.floor(Math.random() * 6); // 0 to +5
      compatibilityScore = Math.min(100, Math.max(0, baseScore + variation));
    }

    res.status(200).json({
      startup,
      reviews,
      stats: {
        avgRating: avgRating.toFixed(1),
        totalReviews: reviews.length,
      },
      compatibilityScore,
    });
  } catch (error) {
    console.error("Error in getStartupById:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Upvote a startup
export async function toggleUpvote(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const startup = await Startup.findById(id);
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }

    const hasUpvoted = startup.upvotes.includes(userId);

    if (hasUpvoted) {
      // Remove upvote
      startup.upvotes = startup.upvotes.filter(
        (id) => id.toString() !== userId.toString()
      );
      startup.upvoteCount = Math.max(0, startup.upvoteCount - 1);
    } else {
      // Add upvote
      startup.upvotes.push(userId);
      startup.upvoteCount += 1;
    }

    await startup.save();

    res.status(200).json({
      message: hasUpvoted ? "Upvote removed" : "Startup upvoted",
      upvoteCount: startup.upvoteCount,
      hasUpvoted: !hasUpvoted,
    });
  } catch (error) {
    console.error("Error in toggleUpvote:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Add review
export async function addReview(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res
        .status(400)
        .json({ message: "Rating and comment are required" });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const startup = await Startup.findById(id);
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({ startup: id, user: userId });
    if (existingReview) {
      // Analyze sentiment using AI (pass rating to improve accuracy)
      const sentiment = analyzeSentiment(comment, rating);

      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
      existingReview.sentimentScore = sentiment.score;
      existingReview.sentimentLabel = sentiment.sentiment;
      await existingReview.save();

      await existingReview.populate("user", "username profilePic fullName");

      return res.status(200).json({
        message: "Review updated",
        review: {
          ...existingReview.toObject(),
          sentiment: {
            label: sentiment.sentiment,
            score: sentiment.score,
          },
        },
      });
    }

    // Analyze sentiment using AI (pass rating to improve accuracy)
    const sentiment = analyzeSentiment(comment, rating);

    // Create new review
    const review = await Review.create({
      startup: id,
      user: userId,
      rating,
      comment,
      sentimentScore: sentiment.score,
      sentimentLabel: sentiment.sentiment,
    });

    await review.populate("user", "username profilePic fullName");

    res.status(201).json({
      message: "Review added",
      review: {
        ...review.toObject(),
        sentiment: {
          label: sentiment.sentiment,
          score: sentiment.score,
        },
      },
    });
  } catch (error) {
    console.error("Error in addReview:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Update startup metrics (revenue, users, roadmap)
export async function updateStartupMetrics(req, res) {
  try {
    const userId = req.user._id;
    const { revenue, users, roadmap } = req.body;

    const startup = await Startup.findOne({ owner: userId });
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }

    if (revenue !== undefined) startup.revenue = revenue;
    if (users !== undefined) startup.users = users;
    if (roadmap !== undefined) startup.roadmap = roadmap;

    await startup.save();

    res.status(200).json({ message: "Metrics updated", startup });
  } catch (error) {
    console.error("Error in updateStartupMetrics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// AI-Powered: Get personalized startup recommendations for investor
export async function getAIRecommendations(req, res) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all approved startups
    const startups = await Startup.find({ status: "approved" })
      .populate("owner", "username profilePic fullName location")
      .lean();

    // Get AI recommendations
    const recommendations = recommendStartupsForInvestor(user, startups, 10);

    // Add compatibility scores with randomization
    const recommendationsWithScores = recommendations.map((startup) => {
      const baseScore = calculateCompatibilityScore(user, startup);
      // Add randomization: ±2-5% variation for better UI (80-85% range if base is around 80)
      const variation = Math.floor(Math.random() * 6) - 2; // -2 to +3
      const compatibilityScore = Math.min(
        100,
        Math.max(0, baseScore + variation)
      );
      return {
        ...startup,
        compatibilityScore,
      };
    });

    res.status(200).json({
      recommendations: recommendationsWithScores,
      message: "AI-powered recommendations generated",
    });
  } catch (error) {
    console.error("Error in getAIRecommendations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// AI-Powered: Semantic search for startups
export async function semanticSearchStartups(req, res) {
  try {
    const { query } = req.query;
    const user = req.user; // Get authenticated user if available

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Get all approved startups
    const startups = await Startup.find({ status: "approved" })
      .populate("owner", "username profilePic fullName location")
      .lean();

    // Use AI to find similar startups
    const results = findSimilarStartups(query, startups, 20);

    // If user is an investor, add compatibility scores with randomization
    if (
      user &&
      user.role === "investor" &&
      user.investorApprovalStatus === "approved"
    ) {
      const resultsWithScores = results.map((startup) => {
        const baseScore = calculateCompatibilityScore(user, startup);
        // Add randomization: +0 to +5 variation for better UI (80-85% range if base is around 80)
        const variation = Math.floor(Math.random() * 6); // 0 to +5
        const compatibilityScore = Math.min(
          100,
          Math.max(0, baseScore + variation)
        );
        return {
          ...startup,
          compatibilityScore,
        };
      });
      return res.status(200).json({
        results: resultsWithScores,
        query,
        count: resultsWithScores.length,
        message: "AI-powered semantic search completed",
      });
    }

    res.status(200).json({
      results,
      query,
      count: results.length,
      message: "AI-powered semantic search completed",
    });
  } catch (error) {
    console.error("Error in semanticSearchStartups:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// AI-Powered: Summarize startup description
export async function summarizeStartupDescription(req, res) {
  try {
    const { id } = req.params;
    const { maxSentences = 2 } = req.query;

    const startup = await Startup.findById(id);

    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }

    const fullText = `${startup.name}. ${startup.tagline}. ${startup.description}`;
    const summary = summarizeText(fullText, parseInt(maxSentences));

    res.status(200).json({
      summary,
      originalLength: fullText.length,
      summaryLength: summary.length,
      message: "AI-powered summary generated",
    });
  } catch (error) {
    console.error("Error in summarizeStartupDescription:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// AI-Powered: Get investment potential for a startup
export async function getInvestmentPotential(req, res) {
  try {
    const { id } = req.params;

    const startup = await Startup.findById(id).lean();

    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }

    const prediction = predictInvestmentPotential(startup);

    res.status(200).json({
      startupId: id,
      startupName: startup.name,
      ...prediction,
      message: "AI-powered investment prediction generated",
    });
  } catch (error) {
    console.error("Error in getInvestmentPotential:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// AI-Powered: Chatbot endpoint
export async function chatbotQuery(req, res) {
  try {
    const { query } = req.body;
    const userId = req.user?._id || null;
    const user = userId
      ? await User.findById(userId).select(
          "username fullName role investorApprovalStatus"
        )
      : null;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Query is required" });
    }

    const lowerQuery = query.toLowerCase().trim();

    // Extract category from query first (check if any category is mentioned)
    const categories = [
      "fintech",
      "finance",
      "healthtech",
      "health",
      "edtech",
      "education",
      "ai/ml",
      "ai",
      "ml",
      "blockchain",
      "saas",
      "e-commerce",
      "ecommerce",
      "agritech",
      "iot",
      "climatetech",
      "proptech",
      "foodtech",
      "gaming",
    ];

    let category = "";
    for (const cat of categories) {
      if (lowerQuery.includes(cat)) {
        category =
          cat === "finance"
            ? "fintech"
            : cat === "health"
            ? "healthtech"
            : cat === "education"
            ? "edtech"
            : cat === "ecommerce"
            ? "e-commerce"
            : cat === "ai" || cat === "ml"
            ? "ai/ml"
            : cat;
        break;
      }
    }

    // Handle startup-related queries - improved pattern matching
    const isStartupQuery =
      /(show|find|list|get|send|recommend|suggest|give|i want|i need).*(startup|startups|company|companies|business)/.test(
        lowerQuery
      ) ||
      /(startup|startups|company|companies).*(finance|fintech|health|edtech|ai|ml|blockchain|saas|ecommerce)/.test(
        lowerQuery
      ) ||
      // Catch queries like "show me fintech" or "find edtech" without "startup" keyword
      (category &&
        /(show|find|list|get|send|recommend|suggest|give|me|i want|i need)/.test(
          lowerQuery
        ));

    if (isStartupQuery) {
      // Get startups
      const queryObj = { status: "approved" };
      if (category) {
        queryObj.category = category.toLowerCase();
      }

      let startups = await Startup.find(queryObj)
        .populate("owner", "username profilePic fullName location")
        .sort({ upvoteCount: -1, createdAt: -1 })
        .limit(10)
        .lean();

      // If user is investor, get AI recommendations
      if (userId) {
        const user = await User.findById(userId);
        if (user && user.role === "investor") {
          const recommendations = recommendStartupsForInvestor(
            user,
            startups,
            10
          );
          if (recommendations.length > 0) {
            startups = recommendations.map((s) => {
              const original = startups.find(
                (st) => st._id.toString() === s._id.toString()
              );
              const baseScore = calculateCompatibilityScore(user, s);
              // Add randomization: ±2-5% variation for better UI (80-85% range if base is around 80)
              const variation = Math.floor(Math.random() * 6) - 2; // -2 to +3
              const compatibilityScore = Math.min(
                100,
                Math.max(0, baseScore + variation)
              );
              return {
                ...original,
                compatibilityScore,
              };
            });
          }
        }
      }

      // Handle 0 results - try semantic search as fallback
      if (startups.length === 0) {
        // Try semantic search as fallback
        const allStartups = await Startup.find({ status: "approved" })
          .populate("owner", "username profilePic fullName location")
          .lean();

        const semanticResults = findSimilarStartups(query, allStartups, 10);

        if (semanticResults.length > 0) {
          // Use semantic search results
          startups = semanticResults;
        } else {
          // Get alternative categories (exclude the searched category)
          const allCategories = [
            "fintech",
            "healthtech",
            "edtech",
            "ai/ml",
            "blockchain",
            "saas",
            "e-commerce",
            "agritech",
            "iot",
            "climatetech",
            "proptech",
            "foodtech",
            "gaming",
          ];

          const alternativeCategories = allCategories
            .filter((cat) => cat !== category)
            .slice(0, 3)
            .join(", ");

          return res.status(200).json({
            response: category
              ? `😔 Sorry, I couldn't find any ${category} startups at the moment. Try searching for other categories like ${alternativeCategories}!`
              : `😔 Sorry, I couldn't find any startups matching your query. Try searching for specific categories like ${alternativeCategories}!`,
            type: "text",
            data: null,
            timestamp: new Date(),
          });
        }
      }

      return res.status(200).json({
        response: category
          ? `✨ Great! I found ${startups.length} ${category} ${
              startups.length === 1 ? "startup" : "startups"
            } for you:`
          : `✨ Great! I found ${startups.length} ${
              startups.length === 1 ? "startup" : "startups"
            } for you:`,
        type: "startups",
        data: startups.map((s) => ({
          _id: s._id,
          name: s.name,
          tagline: s.tagline,
          logo: s.logo,
          category: s.category,
          stage: s.stage,
          upvoteCount: s.upvoteCount || 0,
          compatibilityScore: s.compatibilityScore,
          owner: s.owner,
        })),
        timestamp: new Date(),
      });
    }

    // Handle investor-related queries
    if (
      /(show|find|list|get|send|recommend|suggest).*(investor|investors)/.test(
        lowerQuery
      )
    ) {
      const investors = await User.find({
        role: "investor",
        investorApprovalStatus: "approved",
      })
        .select(
          "username profilePic fullName bio location investmentDomains firm investorRole"
        )
        .limit(10)
        .lean();

      // Handle 0 results
      if (investors.length === 0) {
        return res.status(200).json({
          response: `😔 Sorry, I couldn't find any verified investors at the moment. Check back later!`,
          type: "text",
          data: null,
          timestamp: new Date(),
        });
      }

      return res.status(200).json({
        response: `✨ Great! I found ${investors.length} verified ${
          investors.length === 1 ? "investor" : "investors"
        } for you:`,
        type: "investors",
        data: investors,
        timestamp: new Date(),
      });
    }

    // Default chatbot response - pass user info for personalized responses
    const response = processChatbotQuery(query, user);

    res.status(200).json({
      response: response.response,
      type: response.type,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Error in chatbotQuery:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// AI-Powered: Analyze sentiment of text
export async function analyzeTextSentiment(req, res) {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Text is required" });
    }

    const sentiment = analyzeSentiment(text);

    res.status(200).json({
      text,
      sentiment: sentiment.sentiment,
      score: sentiment.score,
      message: "AI-powered sentiment analysis completed",
    });
  } catch (error) {
    console.error("Error in analyzeTextSentiment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
