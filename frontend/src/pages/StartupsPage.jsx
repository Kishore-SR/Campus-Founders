import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { useThemeStore } from "../store/useThemeStore";
import {
  getApprovedStartups,
  toggleUpvote,
  semanticSearchStartups,
} from "../lib/startup-api";
import PageLoader from "../components/PageLoader";
import InvestmentModal from "../components/InvestmentModal";
import { Link } from "react-router";
import {
  TrendingUp,
  Search,
  Filter,
  ArrowUp,
  ExternalLink,
  Eye,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { STARTUP_DOMAINS } from "../constants";
import toast from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";

const StartupsPage = () => {
  const { theme } = useThemeStore();
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [investmentModalOpen, setInvestmentModalOpen] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [clickedUpvotes, setClickedUpvotes] = useState(new Set());
  const [useAISearch, setUseAISearch] = useState(false);

  // Debounce search term - wait 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // AI Search query - only search if debounced term has at least 2 characters
  const { data: aiSearchResults, isLoading: aiSearchLoading } = useQuery({
    queryKey: ["ai-search", debouncedSearchTerm],
    queryFn: () => semanticSearchStartups(debouncedSearchTerm),
    enabled: useAISearch && debouncedSearchTerm.trim().length >= 2,
  });

  // Regular search query - only search if debounced term has at least 2 characters or is empty
  const { data: regularStartups, isLoading: regularLoading } = useQuery({
    queryKey: ["startups", { search: debouncedSearchTerm, category: selectedCategory }],
    queryFn: () =>
      getApprovedStartups({
        search: debouncedSearchTerm,
        category: selectedCategory,
      }),
    enabled: !useAISearch || debouncedSearchTerm.trim().length === 0 || debouncedSearchTerm.trim().length >= 2,
  });

  // Determine which data to use
  const startups = useAISearch && debouncedSearchTerm.trim().length >= 2
    ? aiSearchResults?.results || []
    : regularStartups || [];

  const isLoading = (useAISearch && debouncedSearchTerm.trim().length >= 2 && aiSearchLoading) ||
    (!useAISearch && regularLoading) ||
    (searchTerm !== debouncedSearchTerm); // Show loading while debouncing

  const { mutate: upvoteMutation } = useMutation({
    mutationFn: toggleUpvote,
    onMutate: async (startupId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(["startups"]);
      await queryClient.cancelQueries(["ai-search", debouncedSearchTerm]);

      // Snapshot the previous value
      const previousStartups = queryClient.getQueryData(["startups", { search: debouncedSearchTerm, category: selectedCategory }]);
      const previousAISearch = queryClient.getQueryData(["ai-search", debouncedSearchTerm]);

      // Optimistically update the cache
      queryClient.setQueryData(["startups", { search: debouncedSearchTerm, category: selectedCategory }], (old) => {
        if (!old) return old;
        return old.map((startup) => {
          if (startup._id === startupId) {
            const userId = authUser?._id?.toString();
            const isCurrentlyUpvoted = startup.upvotes?.some(
              (upvote) => (upvote._id || upvote)?.toString() === userId
            ) || startup.upvotes?.includes(userId);

            const currentUpvoteCount = startup.upvoteCount ?? startup.upvotes?.length ?? 0;
            return {
              ...startup,
              upvotes: isCurrentlyUpvoted
                ? startup.upvotes.filter((upvote) => {
                  const upvoteId = (upvote._id || upvote)?.toString();
                  return upvoteId !== userId;
                })
                : [...(startup.upvotes || []), userId],
              upvoteCount: isCurrentlyUpvoted
                ? Math.max(0, currentUpvoteCount - 1)
                : currentUpvoteCount + 1,
            };
          }
          return startup;
        });
      });

      // Also update AI search results if they exist
      if (previousAISearch?.results) {
        queryClient.setQueryData(["ai-search", debouncedSearchTerm], (old) => {
          if (!old?.results) return old;
          return {
            ...old,
            results: old.results.map((startup) => {
              if (startup._id === startupId) {
                const userId = authUser?._id?.toString();
                const isCurrentlyUpvoted = startup.upvotes?.some(
                  (upvote) => (upvote._id || upvote)?.toString() === userId
                ) || startup.upvotes?.includes(userId);

                const currentUpvoteCount = startup.upvoteCount ?? startup.upvotes?.length ?? 0;
                return {
                  ...startup,
                  upvotes: isCurrentlyUpvoted
                    ? startup.upvotes.filter((upvote) => {
                      const upvoteId = (upvote._id || upvote)?.toString();
                      return upvoteId !== userId;
                    })
                    : [...(startup.upvotes || []), userId],
                  upvoteCount: isCurrentlyUpvoted
                    ? Math.max(0, currentUpvoteCount - 1)
                    : currentUpvoteCount + 1,
                };
              }
              return startup;
            }),
          };
        });
      }

      return { previousStartups, previousAISearch };
    },
    onError: (err, startupId, context) => {
      // Rollback on error
      if (context?.previousStartups) {
        queryClient.setQueryData(["startups", { search: debouncedSearchTerm, category: selectedCategory }], context.previousStartups);
      }
      if (context?.previousAISearch) {
        queryClient.setQueryData(["ai-search", debouncedSearchTerm], context.previousAISearch);
      }
      toast.error("Failed to upvote. Please try again.");
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries(["startups"]);
      queryClient.invalidateQueries(["ai-search"]);
    },
  });

  const handleUpvote = (startupId, isUpvoted) => {
    if (!authUser) {
      toast.error("Please login to upvote");
      return;
    }

    // Only show animation when clicking (upvoting), not when unclicking (removing upvote)
    if (!isUpvoted) {
      setClickedUpvotes((prev) => new Set(prev).add(startupId));
      setTimeout(() => {
        setClickedUpvotes((prev) => {
          const newSet = new Set(prev);
          newSet.delete(startupId);
          return newSet;
        });
      }, 600);
    }

    upvoteMutation(startupId);
  };

  // Don't show full page loader for search - just show loading state in search area
  const showPageLoader = isLoading && !searchTerm && !selectedCategory;

  if (showPageLoader) return <PageLoader />;

  return (
    <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8" data-theme={theme}>
      <Helmet>
        <title>Discover Startups | Campus Founders</title>
        <meta name="description" content="Browse and discover innovative student startups" />
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
              <TrendingUp className="size-8 text-primary" />
              Discover Startups
            </h1>
            <p className="text-lg opacity-70 mt-2">
              Explore innovative student startups from campuses across India
              {useAISearch && searchTerm && (
                <span className="ml-2 badge badge-primary badge-sm">
                  <Sparkles className="size-3 mr-1" />
                  AI-Powered Search
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="card bg-base-200 shadow-lg border border-primary/25">
          <div className="card-body p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 opacity-50" />
                <input
                  type="text"
                  placeholder={useAISearch ? "🤖 AI Search: Describe what you're looking for..." : "Search startups by name, tagline, or description..."}
                  className="input input-bordered w-full pl-10 pr-20 placeholder:opacity-40"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  {isLoading && searchTerm && (
                    <span className="loading loading-spinner loading-sm"></span>
                  )}
                  {searchTerm && (
                    <button
                      onClick={() => setUseAISearch(!useAISearch)}
                      className={`btn btn-sm ${useAISearch ? "btn-primary" : "btn-ghost"}`}
                      title={useAISearch ? "Switch to regular search" : "Switch to AI-powered semantic search"}
                    >
                      <Sparkles className="size-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter */}
              <div className="w-full md:w-64">
                <select
                  className="select select-bordered w-full"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {STARTUP_DOMAINS.map((domain) => (
                    <option key={domain} value={domain.toLowerCase()}>
                      {domain}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Startups List - 2 cards per row on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {startups && startups.length > 0 ? (
            startups.map((startup) => {
              // Properly check if user has upvoted by comparing IDs as strings
              const userId = authUser?._id?.toString();
              const isUpvoted = startup.upvotes?.some(
                (upvote) => (upvote._id || upvote)?.toString() === userId
              ) || startup.upvotes?.includes(userId);
              const truncatedDescription = startup.description?.length > 150
                ? startup.description.substring(0, 150) + "..."
                : startup.description;

              return (
                <div
                  key={startup._id}
                  className="card bg-base-200 shadow-lg hover:shadow-xl transition-all border border-primary/25 hover:border-primary/50"
                >
                  <div className="card-body p-4 sm:p-6">
                    <div className="flex flex-col gap-4 items-start">
                      {/* Startup Info */}
                      <div className="flex-1 space-y-3 w-full">
                        {/* Header */}
                        <div className="flex items-start gap-4">
                          {startup.logo && (
                            <div className="avatar">
                              <div className="w-16 h-16 rounded-lg">
                                <img src={startup.logo} alt={startup.name} />
                              </div>
                            </div>
                          )}
                          <div className="flex-1">
                            <h2 className="text-2xl font-bold hover:text-primary cursor-pointer">
                              <Link to={`/startups/${startup._id}`}>{startup.name}</Link>
                            </h2>
                            <p className="text-lg opacity-70">{startup.tagline}</p>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="opacity-80">{truncatedDescription}</p>

                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-2 items-center">
                          <div className="badge badge-primary">{startup.category}</div>
                          <div className="badge badge-outline">{startup.stage}</div>
                          {/* Compatibility Score for Investors */}
                          {authUser?.role === "investor" &&
                            authUser.investorApprovalStatus === "approved" &&
                            startup.compatibilityScore !== undefined && (
                              <div
                                className={`badge ${startup.compatibilityScore >= 70
                                    ? "badge-success"
                                    : startup.compatibilityScore >= 50
                                      ? "badge-warning"
                                      : "badge-error"
                                  }`}
                                title="Compatibility Score: How well this startup matches your investment interests"
                              >
                                {startup.compatibilityScore}% Match
                              </div>
                            )}
                          {startup.owner && (
                            <div className="flex items-center gap-2 text-sm opacity-70">
                              <span>by</span>
                              <div className="avatar">
                                <div className="w-6 h-6 rounded-full overflow-hidden">
                                  {startup.owner.profilePic && startup.owner.profilePic.trim() ? (
                                    <img
                                      src={startup.owner.profilePic}
                                      alt={startup.owner.username}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs w-full h-full">
                                      {startup.owner.fullName?.charAt(0) || startup.owner.username?.charAt(0) || "U"}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <span className="font-semibold">
                                {startup.owner.fullName || `@${startup.owner.username}`}
                              </span>
                            </div>
                          )}
                          {startup.university && (
                            <div className="text-sm opacity-60">📍 {startup.university}</div>
                          )}
                        </div>
                      </div>

                      {/* Upvote Section - Right Side */}
                      <div className="flex flex-row justify-between items-center w-full pt-2 border-t border-base-300">
                        <div className="flex gap-2">
                          <Link to={`/startups/${startup._id}`} className="btn btn-sm btn-primary">
                            <Eye className="size-4 mr-1" />
                            View Details
                          </Link>
                          {startup.websiteUrl && (
                            <a
                              href={startup.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline"
                            >
                              <ExternalLink className="size-4 mr-1" />
                              Visit Website
                            </a>
                          )}
                          {authUser?.role === "investor" &&
                            authUser.investorApprovalStatus === "approved" && (
                              <button
                                onClick={() => {
                                  setSelectedStartup(startup);
                                  setInvestmentModalOpen(true);
                                }}
                                className="btn btn-sm btn-success"
                              >
                                <DollarSign className="size-4 mr-1" />
                                Invest
                              </button>
                            )}
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => handleUpvote(startup._id, isUpvoted)}
                            className={`btn btn-circle btn-lg transition-all duration-300 relative ${isUpvoted
                              ? "bg-yellow-500 hover:bg-yellow-600 border-yellow-500 text-white shadow-lg shadow-yellow-500/50"
                              : "btn-outline border-base-300 text-base-content hover:bg-base-300 hover:border-yellow-500 hover:text-yellow-500"
                              } ${clickedUpvotes.has(startup._id)
                                ? "animate-bounce scale-125 ring-4 ring-yellow-500/50"
                                : ""
                              }`}
                            style={{
                              animation: clickedUpvotes.has(startup._id)
                                ? "bounce 0.6s ease-in-out"
                                : "",
                            }}
                          >
                            <ArrowUp
                              className={`size-6 transition-transform ${clickedUpvotes.has(startup._id) ? "scale-150" : ""
                                }`}
                            />
                          </button>
                          <div className="flex flex-col items-center">
                            <span
                              className={`font-bold text-xl transition-all duration-300 ${clickedUpvotes.has(startup._id)
                                ? "scale-125 text-yellow-500"
                                : ""
                                }`}
                            >
                              {startup.upvoteCount ?? startup.upvotes?.length ?? 0}
                            </span>
                            <span className="text-xs opacity-60">upvotes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full card bg-base-200 shadow-lg border border-primary/25">
              <div className="card-body text-center py-16">
                <Filter className="size-16 mx-auto opacity-30" />
                <h3 className="text-2xl font-bold mt-4">No startups found</h3>
                <p className="opacity-70">
                  {searchTerm || selectedCategory
                    ? "Try adjusting your search or filters"
                    : "No startups have been approved yet"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Investment Modal */}
      <InvestmentModal
        isOpen={investmentModalOpen}
        onClose={() => {
          setInvestmentModalOpen(false);
          setSelectedStartup(null);
        }}
        startup={selectedStartup}
        founderName={selectedStartup?.owner?.fullName}
      />
    </div >
  );
};

export default StartupsPage;
