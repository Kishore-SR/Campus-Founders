/**
 * AI/ML Utility Functions for Campus Founders
 * Free, lightweight text similarity and summarization
 */

/**
 * Simple text preprocessing - lowercase, remove special chars, split into words
 */
function preprocessText(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2); // Remove very short words
}

/**
 * Calculate TF-IDF vector for a document
 */
function calculateTFIDF(document, allDocuments) {
  const words = preprocessText(document);
  const wordFreq = {};
  words.forEach((word) => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  const tfidf = {};
  const totalWords = words.length;

  Object.keys(wordFreq).forEach((word) => {
    // Term Frequency
    const tf = wordFreq[word] / totalWords;

    // Document Frequency (how many documents contain this word)
    const df = allDocuments.filter((doc) =>
      preprocessText(doc).includes(word)
    ).length;

    // Inverse Document Frequency
    const idf = Math.log(allDocuments.length / (df + 1));

    tfidf[word] = tf * idf;
  });

  return tfidf;
}

/**
 * Calculate cosine similarity between two TF-IDF vectors
 */
function cosineSimilarity(vec1, vec2) {
  const allWords = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  allWords.forEach((word) => {
    const val1 = vec1[word] || 0;
    const val2 = vec2[word] || 0;
    dotProduct += val1 * val2;
    norm1 += val1 * val1;
    norm2 += val2 * val2;
  });

  const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Calculate text similarity between two strings (0 to 1)
 */
export function calculateTextSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;

  const combined = [text1, text2];
  const vec1 = calculateTFIDF(text1, combined);
  const vec2 = calculateTFIDF(text2, combined);

  return cosineSimilarity(vec1, vec2);
}

/**
 * Find similar startups based on query text
 */
export function findSimilarStartups(queryText, startups, limit = 10) {
  if (!queryText || !startups || startups.length === 0) return [];

  // Combine all startup texts for TF-IDF calculation
  const allTexts = startups.map(
    (s) => `${s.name} ${s.tagline} ${s.description} ${s.category}`
  );
  allTexts.push(queryText);

  const queryVector = calculateTFIDF(queryText, allTexts);

  const scored = startups.map((startup) => {
    const startupText = `${startup.name} ${startup.tagline} ${startup.description} ${startup.category}`;
    const startupVector = calculateTFIDF(startupText, allTexts);
    const similarity = cosineSimilarity(queryVector, startupVector);

    return {
      startup,
      similarity,
    };
  });

  // Sort by similarity (highest first) and return top results
  // Lower threshold to 0.05 to include more results, especially for short queries
  return scored
    .sort((a, b) => b.similarity - a.similarity)
    .filter((item) => item.similarity > 0.05) // Lower threshold for better recall
    .slice(0, limit)
    .map((item) => item.startup);
}

/**
 * Recommend startups to an investor based on their interests
 */
export function recommendStartupsForInvestor(investor, startups, limit = 10) {
  if (!investor || !startups || startups.length === 0) return [];

  // Normalize investment domains to lowercase for matching
  const normalizedDomains = (investor.investmentDomains || []).map((domain) =>
    domain.toLowerCase().replace(/\s+/g, "").replace(/[\/&]/g, "")
  );

  // Build investor profile from their interests
  const investorProfile = [
    investor.bio || "",
    investor.investmentDomains?.join(" ") || "",
    investor.currentFocus || "",
  ].join(" ");

  // If investor has investment domains, prioritize category matching
  if (normalizedDomains.length > 0) {
    // First, get startups that match categories directly
    const categoryMatches = startups.filter((startup) => {
      if (!startup.category) return false;
      const normalizedCategory = startup.category
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[\/&]/g, "");
      return normalizedDomains.some(
        (domain) =>
          normalizedCategory.includes(domain) ||
          domain.includes(normalizedCategory) ||
          // Handle variations like "edtech" vs "ed tech" vs "education technology"
          (domain.includes("ed") && normalizedCategory.includes("ed")) ||
          (domain.includes("fin") && normalizedCategory.includes("fin")) ||
          (domain.includes("health") &&
            normalizedCategory.includes("health")) ||
          (domain.includes("ai") &&
            (normalizedCategory.includes("ai") ||
              normalizedCategory.includes("ml")))
      );
    });

    // If we have enough category matches, use them and boost with similarity
    if (categoryMatches.length > 0) {
      // Score each category match
      const scored = categoryMatches.map((startup) => {
        const startupText = `${startup.name} ${startup.tagline} ${startup.description} ${startup.category}`;
        const similarity = investorProfile.trim()
          ? calculateTextSimilarity(investorProfile, startupText)
          : 0.5; // Default similarity if no profile text

        // Boost score for exact category match
        const normalizedCategory = startup.category
          .toLowerCase()
          .replace(/\s+/g, "")
          .replace(/[\/&]/g, "");
        const categoryBoost = normalizedDomains.some(
          (domain) =>
            normalizedCategory === domain ||
            normalizedCategory.includes(domain) ||
            domain.includes(normalizedCategory)
        )
          ? 0.3
          : 0;

        return {
          startup,
          score: similarity + categoryBoost,
        };
      });

      // Sort by score and take top results
      const topMatches = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((item) => item.startup);

      // If we have enough matches, return them
      if (topMatches.length >= Math.min(limit, categoryMatches.length)) {
        return topMatches;
      }

      // Otherwise, fill remaining slots with similarity-based recommendations
      const remaining = limit - topMatches.length;
      const otherStartups = startups.filter(
        (s) =>
          !topMatches.some((tm) => tm._id?.toString() === s._id?.toString())
      );

      if (otherStartups.length > 0 && investorProfile.trim()) {
        const similar = findSimilarStartups(
          investorProfile,
          otherStartups,
          remaining
        );
        return [...topMatches, ...similar];
      }

      return topMatches;
    }
  }

  // Fallback: If no profile or no category matches, use similarity or popularity
  if (!investorProfile.trim()) {
    // If no profile, return popular startups
    return startups
      .sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0))
      .slice(0, limit);
  }

  // Use similarity-based search with lower threshold
  return findSimilarStartups(investorProfile, startups, limit);
}

/**
 * Simple extractive summarization - extract most important sentences
 */
export function summarizeText(text, maxSentences = 2) {
  if (!text) return "";

  // Split into sentences
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20); // Filter very short sentences

  if (sentences.length <= maxSentences) {
    return text;
  }

  // Score sentences by word frequency (simple importance metric)
  const allWords = preprocessText(text);
  const wordFreq = {};
  allWords.forEach((word) => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  const scoredSentences = sentences.map((sentence) => {
    const words = preprocessText(sentence);
    const score = words.reduce((sum, word) => sum + (wordFreq[word] || 0), 0);
    return { sentence, score };
  });

  // Sort by score and take top sentences
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .map((item) => item.sentence)
    .join(". ");

  return topSentences + (topSentences.length < text.length ? "..." : "");
}

/**
 * Calculate investment compatibility score (0-100)
 * Based on how well startup matches investor's interests
 */
export function calculateCompatibilityScore(investor, startup) {
  let score = 50; // Base score

  // Category match - improved matching for variations
  if (
    investor.investmentDomains &&
    investor.investmentDomains.length > 0 &&
    startup.category
  ) {
    const normalizedCategory = startup.category
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[\/&]/g, "");
    const domainMatch = investor.investmentDomains.some((domain) => {
      const normalizedDomain = domain
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[\/&]/g, "");
      return (
        normalizedDomain === normalizedCategory ||
        normalizedCategory.includes(normalizedDomain) ||
        normalizedDomain.includes(normalizedCategory) ||
        // Handle common variations
        (normalizedDomain.includes("ed") &&
          normalizedCategory.includes("ed")) ||
        (normalizedDomain.includes("fin") &&
          normalizedCategory.includes("fin")) ||
        (normalizedDomain.includes("health") &&
          normalizedCategory.includes("health")) ||
        (normalizedDomain.includes("ai") &&
          (normalizedCategory.includes("ai") ||
            normalizedCategory.includes("ml")))
      );
    });

    if (domainMatch) {
      score += 30;
    }
  }

  // Text similarity
  const investorText = [
    investor.bio || "",
    investor.investmentDomains?.join(" ") || "",
  ].join(" ");
  const startupText = `${startup.name} ${startup.tagline} ${startup.description}`;
  const similarity = calculateTextSimilarity(investorText, startupText);
  score += similarity * 20;

  // Stage preference (early stage investors prefer early startups)
  if (startup.stage === "idea" || startup.stage === "prototype") {
    score += 5; // Bonus for early stage
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Sentiment Analysis - Analyze text for positive/negative sentiment
 * Returns: { sentiment: 'positive'|'negative'|'neutral', score: -1 to 1 }
 * @param {string} text - The text to analyze
 * @param {number} rating - Optional rating (1-5) to influence sentiment
 */
export function analyzeSentiment(text, rating = null) {
  if (!text) {
    // If no text but has rating, use rating to determine sentiment
    if (rating !== null) {
      if (rating >= 4) return { sentiment: "positive", score: 0.8 };
      if (rating <= 2) return { sentiment: "negative", score: -0.8 };
      return { sentiment: "neutral", score: 0 };
    }
    return { sentiment: "neutral", score: 0 };
  }

  const words = preprocessText(text);

  // Simple sentiment word lists
  const positiveWords = [
    "great",
    "excellent",
    "amazing",
    "wonderful",
    "fantastic",
    "love",
    "good",
    "best",
    "awesome",
    "brilliant",
    "outstanding",
    "perfect",
    "impressive",
    "innovative",
    "promising",
    "exciting",
    "impressive",
    "solid",
    "strong",
    "successful",
    "valuable",
    "useful",
    "helpful",
    "recommend",
    "enjoy",
    "satisfied",
    "happy",
    "pleased",
    "impressed",
    "excited",
    "optimistic",
    "thank",
    "thanks",
    "thankful",
    "appreciate",
    "passed",
    "help",
  ];

  const negativeWords = [
    "bad",
    "terrible",
    "awful",
    "horrible",
    "worst",
    "disappointing",
    "poor",
    "weak",
    "failing",
    "problem",
    "issue",
    "concern",
    "worry",
    "doubt",
    "skeptical",
    "risky",
    "uncertain",
    "unclear",
    "confused",
    "frustrated",
    "disappointed",
    "concerned",
    "worried",
    "skeptical",
    "not good",
    "doesn't work",
    "broken",
    "failed",
    "failure",
    "improve",
    "need to improve",
  ];

  // Count positive and negative words
  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach((word) => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });

  // Calculate sentiment score (-1 to 1) from text
  const totalSentimentWords = positiveCount + negativeCount;
  let textScore =
    totalSentimentWords > 0
      ? (positiveCount - negativeCount) / Math.max(totalSentimentWords, 1)
      : 0;

  // If rating is provided, use it as a strong signal
  if (rating !== null) {
    // Rating-based sentiment: Direct mapping for clarity
    // 5 stars = strongly positive, 4 stars = positive, 3 stars = neutral, 2 stars = negative, 1 star = strongly negative
    let ratingScore;
    if (rating >= 5) ratingScore = 1.0; // 5 stars = maximum positive
    else if (rating >= 4) ratingScore = 0.7; // 4 stars = positive
    else if (rating >= 3) ratingScore = 0.0; // 3 stars = neutral
    else if (rating >= 2) ratingScore = -0.7; // 2 stars = negative
    else ratingScore = -1.0; // 1 star = maximum negative

    // Combine text score (30% weight) with rating score (70% weight)
    // Rating is much more reliable than text analysis
    const combinedScore = textScore * 0.3 + ratingScore * 0.7;

    // Determine sentiment based on combined score with lower threshold
    // Lower threshold ensures 5-star reviews are always positive
    let sentiment = "neutral";
    if (combinedScore > 0.2) sentiment = "positive";
    else if (combinedScore < -0.2) sentiment = "negative";

    // Override: If rating is 5, always positive; if rating is 1, always negative
    if (rating >= 5) sentiment = "positive";
    else if (rating <= 1) sentiment = "negative";

    return {
      sentiment,
      score: Math.round(combinedScore * 100) / 100,
    };
  }

  // If no rating, use text-only analysis
  let sentiment = "neutral";
  if (textScore > 0.2) sentiment = "positive";
  else if (textScore < -0.2) sentiment = "negative";

  return { sentiment, score: Math.round(textScore * 100) / 100 };
}

/**
 * Auto-generate tags from startup description
 * Returns array of relevant tags/keywords
 */
export function generateTags(text, maxTags = 5) {
  if (!text) return [];

  const words = preprocessText(text);

  // Common stop words to exclude
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "as",
    "is",
    "was",
    "are",
    "were",
    "been",
    "be",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "can",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "what",
    "which",
    "who",
    "when",
    "where",
    "why",
    "how",
    "all",
    "each",
    "every",
    "both",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "no",
    "nor",
    "not",
    "only",
    "own",
    "same",
    "so",
    "than",
    "too",
    "very",
    "just",
  ]);

  // Filter out stop words and count frequency
  const wordFreq = {};
  words.forEach((word) => {
    if (!stopWords.has(word) && word.length > 3) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  // Sort by frequency and return top tags
  const sortedWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxTags)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));

  return sortedWords;
}

/**
 * Investment Prediction/Scoring Model
 * Predicts startup success potential based on multiple factors
 * Returns: { score: 0-100, factors: {...}, prediction: 'high'|'medium'|'low' }
 */
export function predictInvestmentPotential(startup) {
  let score = 0;
  const factors = {};

  // Factor 1: Stage (0-25 points)
  const stageScores = {
    idea: 5,
    prototype: 10,
    mvp: 15,
    beta: 20,
    launched: 25,
    growth: 25,
  };
  factors.stage = stageScores[startup.stage] || 0;
  score += factors.stage;

  // Factor 2: User Growth (0-20 points)
  if (startup.users) {
    if (startup.users > 10000) factors.users = 20;
    else if (startup.users > 5000) factors.users = 15;
    else if (startup.users > 1000) factors.users = 10;
    else if (startup.users > 100) factors.users = 5;
    else factors.users = 0;
    score += factors.users;
  } else {
    factors.users = 0;
  }

  // Factor 3: Revenue (0-20 points)
  if (startup.revenue) {
    if (startup.revenue > 1000000) factors.revenue = 20; // > 10L
    else if (startup.revenue > 500000) factors.revenue = 15; // > 5L
    else if (startup.revenue > 100000) factors.revenue = 10; // > 1L
    else if (startup.revenue > 50000) factors.revenue = 5; // > 50K
    else factors.revenue = 0;
    score += factors.revenue;
  } else {
    factors.revenue = 0;
  }

  // Factor 4: Engagement (Upvotes) (0-15 points)
  const upvotes = startup.upvoteCount || startup.upvotes?.length || 0;
  if (upvotes > 50) factors.engagement = 15;
  else if (upvotes > 25) factors.engagement = 10;
  else if (upvotes > 10) factors.engagement = 5;
  else factors.engagement = 0;
  score += factors.engagement;

  // Factor 5: Team Size (0-10 points)
  const teamSize = startup.team?.length || 0;
  if (teamSize >= 5) factors.team = 10;
  else if (teamSize >= 3) factors.team = 7;
  else if (teamSize >= 2) factors.team = 5;
  else if (teamSize >= 1) factors.team = 2;
  else factors.team = 0;
  score += factors.team;

  // Factor 6: Description Quality (0-10 points)
  const descLength = (startup.description || "").length;
  if (descLength > 500) factors.description = 10;
  else if (descLength > 300) factors.description = 7;
  else if (descLength > 100) factors.description = 5;
  else factors.description = 0;
  score += factors.description;

  // Determine prediction level
  let prediction = "low";
  if (score >= 70) prediction = "high";
  else if (score >= 40) prediction = "medium";

  return {
    score: Math.min(100, Math.max(0, score)),
    factors,
    prediction,
    recommendation:
      prediction === "high"
        ? "Strong investment potential"
        : prediction === "medium"
        ? "Moderate investment potential"
        : "Early stage, higher risk",
  };
}

/**
 * Simple AI Chatbot - Rule-based assistant
 * Handles common queries about the platform
 */
export function processChatbotQuery(query, user = null) {
  if (!query)
    return { response: "How can I help you today?", type: "greeting" };

  const lowerQuery = query.toLowerCase().trim();
  const userName = user?.fullName || user?.username || "there";

  // Greeting patterns - personalized
  if (
    /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|sup|what's up|wassup)/.test(
      lowerQuery
    )
  ) {
    const greeting = lowerQuery.includes("good morning")
      ? "Good morning"
      : lowerQuery.includes("good afternoon")
      ? "Good afternoon"
      : lowerQuery.includes("good evening")
      ? "Good evening"
      : "Hello";

    return {
      response: `${greeting} ${userName}! 👋 I'm your AI assistant for Campus Founders. I can help you with:\n\n✨ Finding startups by category or description\n💼 Investment guidance and recommendations\n📊 Startup analysis and insights\n🔍 Platform navigation\n💡 Startup and investment advice\n\nWhat would you like to explore today?`,
      type: "greeting",
    };
  }

  // Startup search and general startup questions
  if (
    /(find|search|look for|show me|discover|tell me about|what are|list|get).*(startup|company|business|companies)/.test(
      lowerQuery
    ) ||
    /(startup|startups|company|companies).*(what|how|tell|explain|about)/.test(
      lowerQuery
    )
  ) {
    return {
      response: `🚀 **Discovering Startups:**

You can find startups in several ways:

**1. Browse All Startups:**
• Visit the "Startups" page to see all approved startups
• Filter by category (Fintech, Edtech, Healthtech, etc.)
• Sort by upvotes, date, or stage

**2. AI-Powered Semantic Search:**
• Use natural language to describe what you're looking for
• Example: "Show me startups working on AI for education"
• The AI understands context and meaning, not just keywords

**3. AI Recommendations (Investors):**
• Get personalized startup suggestions
• Based on your investment domains and interests
• Includes compatibility scores

**4. Category-Based Search:**
• Ask me: "Show me fintech startups"
• I'll find startups in that category

**5. Specific Queries:**
• "Find early stage startups"
• "Show me trending startups"
• "List AI/ML companies"

Try asking me something like:
• "Show me fintech startups"
• "Find edtech companies"
• "Recommend startups for me" (if you're an investor)

What type of startups are you interested in?`,
      type: "information",
    };
  }

  // Investment queries - comprehensive guidance
  if (
    /(invest|investment|funding|fund|money|capital|how to invest|investing|investment strategy|investment advice|investment tips|where to invest|what to invest|investment guide)/.test(
      lowerQuery
    )
  ) {
    let response = "";

    if (
      /(how to invest|investment strategy|investment advice|investment tips|investment guide)/.test(
        lowerQuery
      )
    ) {
      response = `💼 **Investment Guidance for Startups:**

**1. Due Diligence Checklist:**
• Review startup's business model and revenue streams
• Check team background and experience
• Analyze market size and competition
• Evaluate product-market fit
• Assess financial projections and burn rate

**2. Key Metrics to Consider:**
• Monthly Recurring Revenue (MRR) growth
• Customer Acquisition Cost (CAC)
• Lifetime Value (LTV)
• Churn rate
• Market traction and user engagement

**3. Investment Stages:**
• **Pre-seed/Seed**: Early stage, higher risk, potential for high returns
• **Series A/B**: More established, lower risk, moderate returns
• **Growth Stage**: Mature startups, lower risk, steady returns

**4. Red Flags to Watch:**
• Unrealistic valuations
• Weak team or high turnover
• No clear path to profitability
• Over-reliance on a single customer
• Legal or regulatory issues

**5. Best Practices:**
• Diversify your portfolio across sectors
• Invest only what you can afford to lose
• Do thorough research before committing
• Consider the startup's alignment with your investment goals
• Track your investments regularly

Would you like me to find startups matching your investment criteria?`;
    } else if (
      /(where to invest|what to invest|find investment|investment opportunities)/.test(
        lowerQuery
      )
    ) {
      response = `🔍 **Finding Investment Opportunities:**

I can help you discover startups by:
• **Category**: Fintech, Edtech, Healthtech, AI/ML, etc.
• **Stage**: Pre-seed, Seed, Series A, Growth
• **AI Recommendations**: Personalized matches based on your profile
• **Trending**: Most upvoted and popular startups

Try asking me:
• "Show me fintech startups"
• "Find early stage AI companies"
• "Recommend startups for me" (if you're an investor)

What type of startups are you interested in?`;
    } else {
      response = `💼 **Investment Features:**

As an investor on Campus Founders, you can:
• **Browse Startups**: View all approved startups with detailed information
• **AI Recommendations**: Get personalized startup suggestions based on your interests
• **Compatibility Scores**: See how well startups match your investment profile
• **Connect with Founders**: Message founders directly (Premium feature)
• **Track Investments**: Monitor your investment commitments
• **Investment Analysis**: View AI-powered investment potential scores

**To get started:**
1. Complete your investor profile with investment domains
2. Browse the Startups page
3. Use AI recommendations for personalized matches
4. Review startup details and investment potential
5. Connect with founders and make investment commitments

${
  user?.role === "investor" && user?.investorApprovalStatus === "approved"
    ? "Since you're an approved investor, you can start investing right away! Try asking me to recommend startups for you."
    : user?.role === "investor"
    ? "Your investor profile is pending approval. Once approved, you'll have full access to investment features."
    : "To access investment features, you'll need to sign up as an investor and get approved."
}

Would you like me to help you find specific types of startups or explain any investment feature in detail?`;
    }

    return {
      response,
      type: "information",
    };
  }

  // Profile/account queries
  if (/(profile|account|settings|edit|update)/.test(lowerQuery)) {
    return {
      response:
        "To manage your profile:\n1. Go to your Profile page\n2. Update your bio, interests, and investment domains\n3. Complete your onboarding\n\nA complete profile helps AI provide better recommendations!",
      type: "information",
    };
  }

  // Startup category questions - CHECK BEFORE HELP to catch "What is fintech?" etc.
  if (
    /(fintech|edtech|healthtech|ai|ml|blockchain|saas|ecommerce|agritech|iot|climatetech|proptech|foodtech|gaming).*(what|tell|explain|about|is)/.test(
      lowerQuery
    ) ||
    /(what is|tell me about|explain).*(fintech|edtech|healthtech|ai|ml|blockchain|saas|ecommerce|agritech|iot|climatetech|proptech|foodtech|gaming)/.test(
      lowerQuery
    )
  ) {
    const categoryMap = {
      fintech:
        "Financial Technology - Startups using technology to improve financial services, payments, banking, insurance, and investment management.",
      edtech:
        "Educational Technology - Companies developing technology solutions for education, learning platforms, online courses, and educational tools.",
      healthtech:
        "Health Technology - Startups focused on healthcare innovation, telemedicine, health monitoring, medical devices, and wellness solutions.",
      ai: "Artificial Intelligence - Companies leveraging AI and machine learning for various applications like automation, predictions, and intelligent systems.",
      ml: "Machine Learning - Startups using ML algorithms for data analysis, pattern recognition, and predictive modeling.",
      blockchain:
        "Blockchain Technology - Companies building on blockchain for cryptocurrencies, smart contracts, decentralized applications, and Web3 solutions.",
      saas: "Software as a Service - Cloud-based software solutions delivered as subscription services for businesses and consumers.",
      "e-commerce":
        "E-Commerce - Online retail platforms, marketplaces, and digital commerce solutions.",
      agritech:
        "Agricultural Technology - Startups using technology to improve farming, food production, and agricultural efficiency.",
      iot: "Internet of Things - Companies developing connected devices and IoT solutions for smart homes, cities, and industries.",
      climatetech:
        "Climate Technology - Startups focused on environmental solutions, renewable energy, carbon reduction, and sustainability.",
      proptech:
        "Property Technology - Real estate technology solutions for property management, real estate transactions, and smart buildings.",
      foodtech:
        "Food Technology - Companies innovating in food production, delivery, alternative proteins, and food safety.",
      gaming:
        "Gaming Technology - Game development studios, gaming platforms, esports, and interactive entertainment solutions.",
    };

    let matchedCategory = "";
    for (const [cat, desc] of Object.entries(categoryMap)) {
      if (
        lowerQuery.includes(cat) ||
        lowerQuery.includes(cat.replace("-", ""))
      ) {
        matchedCategory = cat;
        break;
      }
    }

    if (matchedCategory) {
      const categoryName =
        matchedCategory.charAt(0).toUpperCase() + matchedCategory.slice(1);
      return {
        response: `**${categoryName}** - ${categoryMap[matchedCategory]}

Want to see ${matchedCategory} startups? Just ask: "Show me ${matchedCategory} startups"`,
        type: "information",
      };
    }
  }

  // Navigation queries - CHECK BEFORE HELP
  if (
    /(navigate|navigation|how to navigate|help me navigate|how do i navigate|where is|where can i find|how to find|how to get to|how to access|where to go|show me where|direct me|guide me|how to use|how to get started|getting started)/.test(
      lowerQuery
    )
  ) {
    return {
      response: `🗺️ **Platform Navigation Guide:**

**Main Pages:**
• **Home** - Dashboard with featured startups and quick access
• **Startups** - Browse all approved startups with filters
• **Investors** - View investor profiles and connect
• **Connections** - Manage your network and friends
• **Resources** - Access courses and learning materials (Premium)
• **Profile** - Edit your profile and manage settings

**Key Features:**
• **AI Chatbot** (Premium) - Click the sparkles icon for AI assistance
• **Search** - Use the search bar to find startups or users
• **Filters** - On Startups page, filter by category, stage, or sort
• **AI Search** - Click sparkles icon on Startups page for semantic search

**For Founders:**
• Go to Profile → Create/Edit Startup
• Submit for approval once complete
• Track upvotes and reviews

**For Investors:**
• Browse Startups page
• Use AI recommendations
• Connect with founders (Premium)
• Make investment commitments

**Quick Actions:**
• Click "Startups" in sidebar to browse
• Click "Investors" to see investor profiles
• Click "Connections" to manage your network
• Use AI chatbot (Premium) for help anytime

**Premium Features:**
• AI chatbot access
• Video calls with connections
• Extended AI search
• Access to courses
• Startup matching scores

Need help with a specific page or feature? Just ask!`,
      type: "information",
    };
  }

  // Help queries - more comprehensive
  if (
    /(help|how|what|explain|tell me|guide|how do|how can|what is|what are)/.test(
      lowerQuery
    )
  ) {
    // Specific help topics
    if (/(how do i|how can i|how to)/.test(lowerQuery)) {
      if (/(find|search|discover|get).*(startup)/.test(lowerQuery)) {
        return {
          response: `🔍 **How to Find Startups:**

**Method 1: Browse Page**
1. Go to the "Startups" page
2. Use filters to narrow by category or stage
3. Click on any startup to see details

**Method 2: Ask Me**
Just ask me directly! For example:
• "Show me fintech startups"
• "Find AI companies"
• "List edtech startups"

**Method 3: AI Search**
1. Go to Startups page
2. Click the sparkles icon to enable AI search
3. Type natural language queries like "startups using blockchain for finance"

**Method 4: AI Recommendations (Investors)**
1. Complete your investor profile
2. Ask me: "Recommend startups for me"
3. Get personalized matches with compatibility scores

Try asking me to find specific types of startups now!`,
          type: "help",
        };
      } else if (
        /(invest|make investment|commit investment)/.test(lowerQuery)
      ) {
        return {
          response: `💼 **How to Invest:**

**Step-by-Step Guide:**

1. **Get Investor Access:**
   • Sign up as an investor
   • Complete your investor profile
   • Get approved by admin

2. **Find Startups:**
   • Browse the Startups page
   • Use AI recommendations
   • Ask me to find specific types

3. **Review Startup Details:**
   • Check business model and metrics
   • Review team and traction
   • See investment potential score

4. **Make Investment Commitment:**
   • Click "Invest" button on startup page
   • Enter investment amount
   • Choose commitment status (Committed/Pending)
   • Submit your commitment

5. **Track Investments:**
   • View your investment dashboard
   • Monitor committed vs pending amounts
   • Connect with founders

**Tips:**
• Do thorough research before investing
• Start with smaller amounts
• Diversify across sectors
• Review startup metrics carefully

Would you like me to help you find startups to invest in?`,
          type: "help",
        };
      } else if (/(create|add|submit|register).*(startup)/.test(lowerQuery)) {
        return {
          response: `🚀 **How to Create/Submit a Startup:**

1. **Create Your Startup:**
   • Go to your Profile page
   • Click "Create Startup" or "Edit Startup"
   • Fill in all required information:
     - Name, tagline, description
     - Category, stage, university
     - Logo, screenshots
     - Team members, roadmap
     - Company details

2. **Complete Your Profile:**
   • Add all team members
   • Upload screenshots
   • Add company registration details
   • Set up roadmap milestones

3. **Submit for Approval:**
   • Click "Submit for Approval"
   • Wait for admin review
   • Your startup will appear once approved

4. **After Approval:**
   • Your startup is visible to all users
   • Investors can discover and invest
   • Get upvotes and reviews
   • Track engagement metrics

**Tips:**
• Provide detailed descriptions
• Add high-quality screenshots
• Complete all sections
• Keep information updated

Need help with any specific step?`,
          type: "help",
        };
      }
    }

    return {
      response: `🤖 **How I Can Help You:**

**🔍 Finding Startups:**
• Ask me to find startups by category
• Use AI-powered semantic search
• Get personalized recommendations (investors)

**💼 Investment Guidance:**
• Learn about investment strategies
• Understand startup metrics
• Get investment tips and best practices

**📊 Startup Information:**
• Ask about specific startup categories
• Learn about different stages
• Understand startup ecosystem

**💡 Platform Features:**
• AI recommendations
• Semantic search
• Investment tracking
• Founder connections

**Examples of what you can ask:**
• "Show me fintech startups"
• "How do I invest in startups?"
• "What should I look for when investing?"
• "Tell me about edtech companies"
• "Recommend startups for me"

What would you like to know?`,
      type: "help",
    };
  }

  // Features queries
  if (
    /(feature|what can|capabilities|abilities|what does|what are the)/.test(
      lowerQuery
    )
  ) {
    return {
      response: `✨ **AI Features on Campus Founders:**

**1. AI-Powered Recommendations** 🎯
• Personalized startup suggestions for investors
• Based on investment domains and interests
• Includes compatibility scores

**2. Semantic Search** 🔍
• Natural language search
• Understands context and meaning
• Find startups by describing what you want

**3. Text Summarization** 📝
• Auto-generate startup summaries
• Quick overview of long descriptions
• Save time reading

**4. Sentiment Analysis** 😊
• Analyze review sentiments
• Understand community feedback
• Gauge startup reputation

**5. Auto-Tagging** 🏷️
• Automatic tag generation
• Better categorization
• Improved discoverability

**6. Investment Prediction** 📈
• AI-powered investment potential scores
• Risk assessment
• Growth predictions

**7. AI Chatbot** 💬
• That's me! I can help you:
  - Find startups
  - Investment guidance
  - Platform navigation
  - Answer questions

Which feature would you like to learn more about?`,
      type: "information",
    };
  }

  // Startup stage questions
  if (
    /(pre-seed|seed|series a|series b|growth|early stage|late stage|stage).*(what|tell|explain|about|is)/.test(
      lowerQuery
    ) ||
    /(what is|tell me about|explain).*(pre-seed|seed|series a|series b|growth|early stage|late stage)/.test(
      lowerQuery
    )
  ) {
    return {
      response: `📊 **Startup Stages Explained:**

**Pre-Seed Stage:**
• Very early stage, often just an idea
• Usually self-funded or friends & family
• Building MVP or prototype
• High risk, high potential

**Seed Stage:**
• Product launched, initial traction
• First external funding round
• Proving product-market fit
• Building user base

**Series A:**
• Proven business model
• Significant revenue or users
• Scaling operations
• Established market presence

**Series B & Beyond:**
• Strong revenue and growth
• Expanding to new markets
• Building competitive moat
• Path to profitability

**Growth Stage:**
• Mature startup
• Established market position
• Consistent revenue
• Lower risk, steady growth

Would you like me to find startups at a specific stage?`,
      type: "information",
    };
  }

  // Thank you / appreciation
  if (
    /(thank|thanks|appreciate|grateful|awesome|great|good|nice|helpful)/.test(
      lowerQuery
    )
  ) {
    return {
      response: `You're welcome, ${userName}! 😊 I'm always here to help you discover amazing startups and make informed investment decisions. Feel free to ask me anything anytime!

Is there anything else you'd like to know?`,
      type: "greeting",
    };
  }

  // Goodbye
  if (/(bye|goodbye|see you|later|farewell|exit|quit)/.test(lowerQuery)) {
    return {
      response: `Goodbye ${userName}! 👋 It was great helping you today. Come back anytime if you need assistance finding startups or investment guidance. Have a great day!`,
      type: "greeting",
    };
  }

  // Default response - more helpful
  return {
    response: `I'm here to help you, ${userName}! 🤖 I can assist with:

**🔍 Finding Startups:**
• "Show me fintech startups"
• "Find AI companies"
• "Recommend startups for me"

**💼 Investment Guidance:**
• "How do I invest?"
• "Investment tips"
• "What to look for when investing"

**📚 Learning:**
• "What is fintech?"
• "Explain startup stages"
• "Tell me about edtech"

**💡 Platform Help:**
• "How do I find startups?"
• "What features are available?"
• "Help me navigate"

Try asking me something specific, or use one of the suggestions above!`,
    type: "default",
  };
}
