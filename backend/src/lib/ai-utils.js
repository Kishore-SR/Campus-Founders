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
  return scored
    .sort((a, b) => b.similarity - a.similarity)
    .filter((item) => item.similarity > 0.1) // Filter out very low similarity
    .slice(0, limit)
    .map((item) => item.startup);
}

/**
 * Recommend startups to an investor based on their interests
 */
export function recommendStartupsForInvestor(investor, startups, limit = 10) {
  if (!investor || !startups || startups.length === 0) return [];

  // Build investor profile from their interests
  const investorProfile = [
    investor.bio || "",
    investor.investmentDomains?.join(" ") || "",
    investor.currentFocus || "",
  ].join(" ");

  if (!investorProfile.trim()) {
    // If no profile, return popular startups
    return startups
      .sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0))
      .slice(0, limit);
  }

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

  // Category match
  if (
    investor.investmentDomains &&
    investor.investmentDomains.length > 0 &&
    investor.investmentDomains.some(
      (domain) => domain.toLowerCase() === startup.category?.toLowerCase()
    )
  ) {
    score += 30;
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
 */
export function analyzeSentiment(text) {
  if (!text) return { sentiment: "neutral", score: 0 };

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
  ];

  // Count positive and negative words
  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach((word) => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });

  // Calculate sentiment score (-1 to 1)
  const totalSentimentWords = positiveCount + negativeCount;
  const score =
    totalSentimentWords > 0
      ? (positiveCount - negativeCount) / Math.max(totalSentimentWords, 1)
      : 0;

  // Determine sentiment
  let sentiment = "neutral";
  if (score > 0.2) sentiment = "positive";
  else if (score < -0.2) sentiment = "negative";

  return { sentiment, score: Math.round(score * 100) / 100 };
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
export function processChatbotQuery(query) {
  if (!query)
    return { response: "How can I help you today?", type: "greeting" };

  const lowerQuery = query.toLowerCase().trim();

  // Greeting patterns
  if (
    /^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/.test(
      lowerQuery
    )
  ) {
    return {
      response:
        "Hello! I'm your AI assistant. I can help you with:\n• Finding startups\n• Investment recommendations\n• Platform navigation\n• Startup information\n\nWhat would you like to know?",
      type: "greeting",
    };
  }

  // Startup search
  if (
    /(find|search|look for|show me|discover).*(startup|company|business)/.test(
      lowerQuery
    )
  ) {
    return {
      response:
        "You can discover startups by:\n1. Visiting the 'Startups' page\n2. Using AI-powered semantic search\n3. Checking AI recommendations (for investors)\n4. Filtering by category\n\nWould you like me to explain any of these features?",
      type: "information",
    };
  }

  // Investment queries
  if (/(invest|investment|funding|fund|money|capital)/.test(lowerQuery)) {
    return {
      response:
        "As an investor, you can:\n• Browse approved startups\n• Get AI-powered recommendations based on your interests\n• View compatibility scores\n• Connect with founders\n• Track investments\n\nMake sure your investor profile is complete for better recommendations!",
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

  // Help queries
  if (/(help|how|what|explain|tell me|guide)/.test(lowerQuery)) {
    return {
      response:
        "I can help you with:\n\n🔍 **Searching**: Use AI search to find startups by describing what you're looking for\n\n💡 **Recommendations**: Investors get personalized startup recommendations\n\n📊 **Analysis**: View sentiment analysis on reviews and investment potential scores\n\n🏷️ **Tags**: Startups get auto-generated tags for better discoverability\n\nAsk me anything about these features!",
      type: "help",
    };
  }

  // Features queries
  if (/(feature|what can|capabilities|abilities)/.test(lowerQuery)) {
    return {
      response:
        "Our AI features include:\n\n✨ AI-Powered Recommendations\n🔍 Semantic Search\n📝 Text Summarization\n😊 Sentiment Analysis\n🏷️ Auto-Tagging\n📈 Investment Prediction\n💬 AI Chatbot (that's me!)\n\nWhich feature would you like to learn more about?",
      type: "information",
    };
  }

  // Default response
  return {
    response:
      "I'm here to help! You can ask me about:\n• Finding startups\n• Investment opportunities\n• Platform features\n• AI capabilities\n\nTry asking: 'How do I find startups?' or 'What AI features are available?'",
    type: "default",
  };
}
