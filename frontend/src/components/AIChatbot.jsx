import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, ExternalLink, TrendingUp, User } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { chatbotQuery } from "../lib/startup-api";
import toast from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";

// Simple markdown parser for bold text (**text**)
const parseMarkdown = (text) => {
  if (!text) return "";

  // Match **text** patterns (non-greedy to handle multiple instances)
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    // Check if this part is a bold marker
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      // Remove ** and make bold
      const boldText = part.slice(2, -2);
      return <strong key={index} className="font-bold">{boldText}</strong>;
    }
    // Return regular text, preserving newlines
    return <span key={index}>{part}</span>;
  });
};

const AIChatbot = () => {
  const { authUser } = useAuthUser();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const userName = authUser?.fullName || authUser?.username || "there";
    return [
      {
        type: "bot",
        text: `Hello ${userName}! 👋 I'm your AI assistant for Campus Founders. I can help you with:\n\n✨ Finding startups by category or description\n💼 Investment guidance and recommendations\n📊 Startup analysis and insights\n🔍 Platform navigation\n💡 Startup and investment advice\n\nTry asking me:`,
        timestamp: new Date(),
        suggestions: [
          "Show me fintech startups",
          "How do I invest in startups?",
          "What is fintech?",
          "Recommend startups for me",
        ],
      },
    ];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const handleSuggestionClick = (suggestion) => {
    // Send the suggestion directly
    handleSend(suggestion);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async (textToSend = null, e = null) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const queryText = textToSend || input.trim();
    if (!queryText || isLoading) return;

    const userMessage = {
      type: "user",
      text: queryText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chatbotQuery(queryText);

      // Predefined suggestions based on response type
      let suggestions = [];
      if (response.type === "startups") {
        suggestions = [
          "Show me more startups",
          "Find edtech startups",
          "What is fintech?",
          "Recommend startups for me",
        ];
      } else if (response.type === "investors") {
        suggestions = [
          "List more investors",
          "Show fintech investors",
          "How do I connect with investors?",
          "Tell me about investment process",
        ];
      } else {
        // General suggestions after text response
        suggestions = [
          "Show me fintech startups",
          "Find edtech startups",
          "List investors",
          "How do I invest?",
        ];
      }

      const botMessage = {
        type: "bot",
        text: response.response,
        timestamp: new Date(),
        dataType: response.type, // 'startups', 'investors', or regular text
        data: response.data || null, // Array of startups or investors
        suggestions: suggestions, // Show predefined suggestions after response
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      toast.error("Failed to get response from AI");
      const errorMessage = {
        type: "bot",
        text: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
        suggestions: [
          "Show me fintech startups",
          "Find edtech startups",
          "List investors",
          "How do I invest?",
        ],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOpenChat = () => {
    if (!authUser?.isPremium) {
      toast.error("Premium subscription required for AI chat");
      navigate("/premium");
      return;
    }
    setIsOpen(true);
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleOpenChat}
        className="fixed bottom-6 right-6 btn btn-circle btn-primary btn-lg shadow-lg z-50 hover:scale-110 transition-transform"
        title="Open AI Assistant"
      >
        <Sparkles className="size-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-base-100 shadow-2xl rounded-lg border border-base-300 flex flex-col z-50">
      {/* Header */}
      <div className="bg-primary text-primary-content p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5" />
          <h3 className="font-bold text-lg">AI Assistant</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="btn btn-ghost btn-sm btn-circle"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] rounded-lg p-3 ${msg.type === "user"
                ? "bg-primary text-primary-content"
                : "bg-base-200 text-base-content"
                }`}
            >
              <div className="text-sm whitespace-pre-line mb-2">
                {parseMarkdown(msg.text)}
              </div>

              {/* Suggestion Buttons */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {msg.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSuggestionClick(suggestion);
                      }}
                      className="btn btn-sm btn-outline btn-primary text-xs"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Startup Cards */}
              {msg.dataType === "startups" && msg.data && msg.data.length > 0 && (
                <div className="space-y-2 mt-3">
                  {msg.data.map((startup) => (
                    <Link
                      key={startup._id}
                      to={`/startups/${startup._id}`}
                      className="block bg-base-100 rounded-lg p-3 border border-base-300 hover:border-primary hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3">
                        {startup.logo && (
                          <div className="avatar flex-shrink-0">
                            <div className="w-12 h-12 rounded-lg">
                              <img src={startup.logo} alt={startup.name} />
                            </div>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-sm hover:text-primary">
                              {startup.name}
                            </h4>
                            {startup.compatibilityScore && (
                              <span className="badge badge-success badge-sm flex-shrink-0">
                                <Sparkles className="size-3 mr-1" />
                                {startup.compatibilityScore}%
                              </span>
                            )}
                          </div>
                          <p className="text-xs opacity-70 line-clamp-1 mt-1">
                            {startup.tagline}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            <span className="badge badge-primary badge-xs">
                              {startup.category}
                            </span>
                            <span className="badge badge-outline badge-xs">
                              {startup.stage}
                            </span>
                            {startup.upvoteCount > 0 && (
                              <span className="badge badge-ghost badge-xs flex items-center gap-1">
                                <TrendingUp className="size-3" />
                                {startup.upvoteCount}
                              </span>
                            )}
                          </div>
                        </div>
                        <ExternalLink className="size-4 opacity-50 flex-shrink-0 mt-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Investor Cards */}
              {msg.dataType === "investors" && msg.data && msg.data.length > 0 && (
                <div className="space-y-2 mt-3">
                  {msg.data.map((investor) => (
                    <div
                      key={investor._id}
                      className="block bg-base-100 rounded-lg p-3 border border-base-300 hover:border-primary hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3">
                        {investor.profilePic && (
                          <div className="avatar flex-shrink-0">
                            <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1 overflow-hidden">
                              {investor.profilePic && investor.profilePic.trim() ? (
                                <img
                                  src={investor.profilePic}
                                  alt={investor.username}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm w-full h-full">
                                  {investor.fullName?.charAt(0) || investor.username?.charAt(0) || "I"}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-sm">
                              {investor.fullName || `@${investor.username}`}
                            </h4>
                            <span className="badge badge-info badge-sm flex-shrink-0">
                              <User className="size-3 mr-1" />
                              Investor
                            </span>
                          </div>
                          {investor.firm && (
                            <p className="text-xs opacity-70 mt-1">
                              {investor.firm}
                            </p>
                          )}
                          {investor.bio && (
                            <p className="text-xs opacity-70 line-clamp-2 mt-1">
                              {investor.bio}
                            </p>
                          )}
                          {investor.investmentDomains && investor.investmentDomains.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {investor.investmentDomains.slice(0, 3).map((domain, i) => (
                                <span key={i} className="badge badge-secondary badge-xs">
                                  {domain}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-base-200 rounded-lg p-3">
              <span className="loading loading-dots loading-sm"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-base-300">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSend();
            return false;
          }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask me anything..."
            className="input input-bordered flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSend();
            }}
            className="btn btn-primary"
            disabled={isLoading || !input.trim()}
          >
            <Send className="size-4" />
          </button>
        </form>
        <p className="text-xs opacity-60 mt-2">
          Try: "Show me fintech" or "Find edtech startups" or "List investors"
        </p>
      </div>
    </div>
  );
};

export default AIChatbot;

