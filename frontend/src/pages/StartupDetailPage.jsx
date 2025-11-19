import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStartupById, toggleUpvote, addReview } from "../lib/startup-api";
import { getStartupInvestments } from "../lib/investment-api";
import { getUserFriends, getOutgoingFriendReqs, sendFriendRequest } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import { Helmet } from "react-helmet-async";
import { useThemeStore } from "../store/useThemeStore";
import {
  ArrowUp,
  Star,
  MessageSquare,
  ExternalLink,
  Users,
  TrendingUp,
  DollarSign,
  MapPin,
  Calendar,
  Send,
  UserPlus,
  ChevronLeft,
  Clock,
  MessageSquareIcon,
} from "lucide-react";
import PageLoader from "../components/PageLoader";
import toast from "react-hot-toast";
import InvestmentModal from "../components/InvestmentModal";

const StartupDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthUser();
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();
  const [investmentModalOpen, setInvestmentModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [clickedUpvotes, setClickedUpvotes] = useState(new Set());
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [sendingRequestIds, setSendingRequestIds] = useState(new Set());

  // Scroll to top smoothly when component mounts or id changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const { data: response, isLoading } = useQuery({
    queryKey: ["startup", id],
    queryFn: () => getStartupById(id),
  });

  const startup = response?.startup;
  const compatibilityScore = response?.compatibilityScore;

  // Fetch friends to check if already connected
  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
    enabled: !!authUser && !!startup?.owner,
  });

  // Fetch outgoing friend requests
  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
    enabled: !!authUser && !!startup?.owner,
  });

  // Update outgoing requests set
  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        if (req && req.recipient) {
          const recipientId = req.recipient._id || req.recipient;
          if (recipientId) {
            outgoingIds.add(recipientId);
          }
        }
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);

  // Send friend request mutation
  const { mutate: sendRequestMutation } = useMutation({
    mutationFn: (userId) => {
      setSendingRequestIds((prev) => new Set(prev).add(userId));
      return sendFriendRequest(userId);
    },
    onSuccess: (_, userId) => {
      setOutgoingRequestsIds((prev) => new Set(prev).add(userId));
      setSendingRequestIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (_, userId) => {
      setSendingRequestIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    },
  });

  // Check connection status
  const getConnectionStatus = (founderId) => {
    if (!authUser || !founderId) return null;

    // Check if already connected (friends)
    const isConnected = friends?.some((friend) => friend._id === founderId);
    if (isConnected) return "connected";

    // Check if request is pending
    const isPending = outgoingRequestsIds.has(founderId);
    if (isPending) return "pending";

    return null;
  };

  const reviews = response?.reviews || [];
  const apiStats = response?.stats || {};

  // Fetch investments if user is the owner
  const { data: investmentsData } = useQuery({
    queryKey: ["startupInvestments", id],
    queryFn: () => getStartupInvestments(id),
    enabled: !!startup && startup.owner?._id === authUser?._id,
  });

  const upvoteMutation = useMutation({
    mutationFn: () => toggleUpvote(id),
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(["startup", id]);

      // Snapshot the previous value
      const previousResponse = queryClient.getQueryData(["startup", id]);

      // Optimistically update the cache
      queryClient.setQueryData(["startup", id], (old) => {
        if (!old?.startup) return old;

        const userId = authUser?._id?.toString();
        const startup = old.startup;
        const isCurrentlyUpvoted = startup.upvotes?.some(
          (upvote) => (upvote._id || upvote)?.toString() === userId
        ) || startup.upvotes?.includes(userId);

        const updatedStartup = {
          ...startup,
          upvotes: isCurrentlyUpvoted
            ? startup.upvotes.filter((upvote) => {
              const upvoteId = (upvote._id || upvote)?.toString();
              return upvoteId !== userId;
            })
            : [...(startup.upvotes || []), userId],
          upvoteCount: isCurrentlyUpvoted
            ? Math.max(0, (startup.upvoteCount || startup.upvotes?.length || 0) - 1)
            : (startup.upvoteCount || startup.upvotes?.length || 0) + 1,
        };

        return {
          ...old,
          startup: updatedStartup,
        };
      });

      return { previousResponse };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousResponse) {
        queryClient.setQueryData(["startup", id], context.previousResponse);
      }
      toast.error("Failed to upvote. Please try again.");
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries(["startup", id]);
    },
  });

  const reviewMutation = useMutation({
    mutationFn: () => addReview(id, reviewForm),
    onSuccess: () => {
      toast.success("Review added successfully!");
      queryClient.invalidateQueries(["startup", id]);
      setReviewForm({ rating: 5, comment: "" });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add review");
    },
  });

  // Helper function to check if user has upvoted
  const hasUserUpvoted = () => {
    if (!authUser || !startup?.upvotes) return false;
    return startup.upvotes.some(
      (upvote) => (upvote._id || upvote)?.toString() === authUser._id?.toString()
    );
  };

  const handleUpvote = () => {
    if (!authUser) {
      toast.error("Please login to upvote");
      return;
    }

    const isUpvoted = hasUserUpvoted();

    // Only show animation when clicking (upvoting), not when unclicking (removing upvote)
    if (!isUpvoted) {
      setClickedUpvotes((prev) => new Set(prev).add(id));
      setTimeout(() => {
        setClickedUpvotes((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }, 600);
    }

    upvoteMutation.mutate();
  };

  // Get initials from name (first letter of first name + first letter of last name)
  const getInitials = (name) => {
    if (!name) return "TM";
    const parts = name.trim().split(" ").filter(part => part.length > 0);
    if (parts.length >= 2) {
      const firstInitial = parts[0]?.[0]?.toUpperCase() || "";
      const lastInitial = parts[parts.length - 1]?.[0]?.toUpperCase() || "";
      return (firstInitial + lastInitial) || "TM";
    }
    if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase() || "TM";
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      toast.error("Please enter a review comment");
      return;
    }
    reviewMutation.mutate();
  };

  if (isLoading) return <PageLoader />;

  if (!startup) {
    return (
      <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8" data-theme={theme}>
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body text-center">
            <h2 className="text-2xl font-bold">Startup Not Found</h2>
            <p className="opacity-70 mt-2">The startup you're looking for doesn't exist.</p>
            <Link to="/startups" className="btn btn-primary mt-4">
              <ChevronLeft className="size-4 mr-2" />
              Back to Startups
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    upvotes: startup?.upvoteCount || startup?.upvotes?.length || 0,
    reviews: apiStats.totalReviews || reviews.length || 0,
    avgRating: parseFloat(apiStats.avgRating) || 0,
  };

  return (
    <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8" data-theme={theme}>
      <Helmet>
        <title>{startup.name} | Campus Founders</title>
        <meta name="description" content={startup.tagline || startup.description} />
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/startups")}
          className="btn btn-ghost btn-sm"
        >
          <ChevronLeft className="size-4 mr-1" />
          Back to Startups
        </button>

        {/* Main Startup Card */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <div className="flex flex-col gap-6">
              {/* Logo and Title */}
              <div className="flex items-start gap-4">
                <div className="avatar">
                  <div className="w-24 h-24 rounded-lg">
                    {startup.logo && startup.logo.trim() ? (
                      <img src={startup.logo} alt={startup.name} />
                    ) : (
                      <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-bold text-primary-content w-full h-full">
                        {startup.name?.charAt(0) || "S"}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold">{startup.name}</h1>
                  <p className="text-xl opacity-70 mt-2">{startup.tagline}</p>
                </div>
              </div>

              {/* Meta Badges */}
              <div className="flex flex-wrap gap-2">
                <div className="badge badge-primary badge-lg">{startup.category}</div>
                <div className="badge badge-outline badge-lg">{startup.stage}</div>
                {/* Compatibility Score for Investors - same style as /startups cards */}
                {authUser?.role === "investor" &&
                  authUser.investorApprovalStatus === "approved" &&
                  compatibilityScore !== undefined && (
                    <div
                      className={`badge ${compatibilityScore >= 70
                        ? "badge-success"
                        : compatibilityScore >= 50
                          ? "badge-warning"
                          : "badge-error"
                        }`}
                      title="Compatibility Score: How well this startup matches your investment interests"
                    >
                      {compatibilityScore}% Match
                    </div>
                  )}
                {startup.university && (
                  <div className="badge badge-ghost badge-lg gap-1">
                    <MapPin className="size-3" />
                    {startup.university}
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-lg opacity-80 whitespace-pre-wrap">{startup.description}</p>

              {/* Investment Stats (only if exists) */}
              {investmentsData && investmentsData.stats.totalCommitted > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-base-300">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">
                      ₹{investmentsData.stats.totalCommitted.toLocaleString()}
                    </div>
                    <div className="text-sm opacity-70">Committed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning">
                      ₹{investmentsData.stats.totalPending.toLocaleString()}
                    </div>
                    <div className="text-sm opacity-70">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {investmentsData.stats.total || 0}
                    </div>
                    <div className="text-sm opacity-70">Investors</div>
                  </div>
                </div>
              )}

              {/* Actions & Info Row - Professional Layout */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pt-6 border-t border-base-300">
                {/* Left Side: Engagement Stats & Actions */}
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Upvote Section */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={handleUpvote}
                      className={`btn btn-circle btn-lg transition-all duration-300 relative ${hasUserUpvoted()
                        ? "bg-yellow-500 hover:bg-yellow-600 border-yellow-500 text-white shadow-lg shadow-yellow-500/50"
                        : "btn-outline border-base-300 text-base-content hover:bg-base-300 hover:border-yellow-500 hover:text-yellow-500"
                        } ${clickedUpvotes.has(id)
                          ? "animate-bounce scale-125 ring-4 ring-yellow-500/50"
                          : ""
                        }`}
                      style={{
                        animation: clickedUpvotes.has(id)
                          ? "bounce 0.6s ease-in-out"
                          : "",
                      }}
                    >
                      <ArrowUp
                        className={`size-6 transition-transform ${clickedUpvotes.has(id) ? "scale-150" : ""
                          }`}
                      />
                    </button>
                    <span className="text-sm opacity-70">
                      <span
                        className={`font-bold transition-all duration-300 ${clickedUpvotes.has(id)
                          ? "scale-125 text-yellow-500"
                          : ""
                          }`}
                      >
                        {stats.upvotes || 0}
                      </span>
                      {" "}upvotes
                    </span>
                  </div>

                  {/* Rating & Reviews */}
                  <div className="flex flex-col items-center gap-1 px-4 border-l border-r border-base-300">
                    <div className="flex items-center gap-1">
                      <Star className="size-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-2xl font-bold">
                        {stats.avgRating?.toFixed(1) || "0.0"}
                      </span>
                    </div>
                    <span className="text-sm opacity-70">
                      {stats.reviews || 0} {stats.reviews === 1 ? "Review" : "Reviews"}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Investment Button for Investors */}
                    {authUser?.role === "investor" &&
                      authUser.investorApprovalStatus === "approved" &&
                      startup.owner?._id !== authUser._id && (
                        <button
                          onClick={() => setInvestmentModalOpen(true)}
                          className="btn btn-success btn-lg"
                        >
                          <DollarSign className="size-5 mr-2" />
                          Invest
                        </button>
                      )}

                    {/* Dynamic Connect/Message/Pending Button */}
                    {authUser &&
                      authUser._id !== startup.owner?._id &&
                      authUser.role !== "investor" &&
                      (() => {
                        const connectionStatus = getConnectionStatus(startup.owner?._id);
                        const isSending = sendingRequestIds.has(startup.owner?._id);

                        if (connectionStatus === "connected") {
                          return (
                            <button
                              onClick={() => {
                                if (!authUser?.isPremium) {
                                  toast.error("Premium subscription required for chat");
                                  navigate("/premium");
                                } else {
                                  navigate(`/chat/${startup.owner?._id}`);
                                }
                              }}
                              className="btn btn-primary btn-sm"
                            >
                              <MessageSquareIcon className="size-4 mr-2" />
                              Message
                            </button>
                          );
                        } else if (connectionStatus === "pending" || isSending) {
                          return (
                            <button
                              className="btn btn-warning btn-sm"
                              disabled
                            >
                              <Clock className="size-4 mr-2" />
                              {isSending ? "Sending..." : "Request Pending"}
                            </button>
                          );
                        } else {
                          return (
                            <button
                              onClick={() => sendRequestMutation(startup.owner._id)}
                              className="btn btn-primary btn-sm"
                              disabled={isSending}
                            >
                              <UserPlus className="size-4 mr-2" />
                              {isSending ? "Sending..." : "Connect"}
                            </button>
                          );
                        }
                      })()}
                  </div>
                </div>

                {/* Right Side: Founder Info & Links */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
                  {/* Founder Info */}
                  {startup.owner && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-base-300 rounded-lg">
                      <div className="avatar">
                        <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1 overflow-hidden">
                          {startup.owner.profilePic && startup.owner.profilePic.trim() ? (
                            <img
                              src={startup.owner.profilePic}
                              alt={startup.owner.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg w-full h-full">
                              {startup.owner.fullName?.charAt(0) || startup.owner.username?.charAt(0) || "U"}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-base">
                          {startup.owner.fullName || `@${startup.owner.username}`}
                        </p>
                        <p className="text-xs opacity-70">Founder</p>
                      </div>
                    </div>
                  )}

                  {/* Website Links */}
                  <div className="flex items-center gap-2">
                    {startup.websiteUrl && (
                      <a
                        href={startup.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                      >
                        <ExternalLink className="size-4 mr-2" />
                        Website
                      </a>
                    )}
                    {startup.demoUrl && (
                      <a
                        href={startup.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                      >
                        <ExternalLink className="size-4 mr-2" />
                        Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Screenshots */}
        {startup.screenshots && startup.screenshots.length > 0 && (
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="text-2xl font-bold mb-4">Screenshots</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {startup.screenshots.map((screenshot, index) => (
                  <div key={index} className="aspect-video rounded-lg overflow-hidden">
                    <img
                      src={screenshot}
                      alt={`${startup.name} screenshot ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(screenshot, "_blank")}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Company Registration Details */}
        {(startup.mobileNumber || startup.companyRegisteredLocation || startup.companyType || startup.fundingRound || (startup.numberOfEmployees !== undefined && startup.numberOfEmployees !== null && startup.numberOfEmployees > 0) || startup.companyContactInfo) && (
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="text-2xl font-bold mb-4">Company Registration Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {startup.mobileNumber && (
                  <div className="p-3 bg-base-300 rounded-lg">
                    <p className="text-sm opacity-70">Mobile Number</p>
                    <p className="font-semibold">{startup.mobileNumber}</p>
                  </div>
                )}
                {startup.companyRegisteredLocation && (
                  <div className="p-3 bg-base-300 rounded-lg">
                    <p className="text-sm opacity-70">Registered Location</p>
                    <p className="font-semibold">{startup.companyRegisteredLocation}</p>
                  </div>
                )}
                {startup.companyType && (
                  <div className="p-3 bg-base-300 rounded-lg">
                    <p className="text-sm opacity-70">Company Type</p>
                    <p className="font-semibold capitalize">{startup.companyType}</p>
                  </div>
                )}
                {startup.fundingRound && (
                  <div className="p-3 bg-base-300 rounded-lg">
                    <p className="text-sm opacity-70">Funding Round</p>
                    <p className="font-semibold capitalize">{startup.fundingRound}</p>
                  </div>
                )}
                {startup.numberOfEmployees !== undefined && startup.numberOfEmployees !== null && startup.numberOfEmployees > 0 && (
                  <div className="p-3 bg-base-300 rounded-lg">
                    <p className="text-sm opacity-70">Team Size</p>
                    <p className="font-semibold">{startup.numberOfEmployees} {startup.numberOfEmployees === 1 ? "employee" : "employees"}</p>
                  </div>
                )}
              </div>
              {startup.companyContactInfo && (startup.companyContactInfo.email || startup.companyContactInfo.phone || startup.companyContactInfo.address) && (
                <div className="mt-4 pt-4 border-t border-base-300">
                  <h4 className="font-semibold mb-3">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {startup.companyContactInfo.email && (
                      <div className="p-3 bg-base-300 rounded-lg">
                        <p className="text-sm opacity-70">Email</p>
                        <p className="font-semibold">{startup.companyContactInfo.email}</p>
                      </div>
                    )}
                    {startup.companyContactInfo.phone && (
                      <div className="p-3 bg-base-300 rounded-lg">
                        <p className="text-sm opacity-70">Phone</p>
                        <p className="font-semibold">{startup.companyContactInfo.phone}</p>
                      </div>
                    )}
                    {startup.companyContactInfo.address && (
                      <div className="p-3 bg-base-300 rounded-lg md:col-span-2">
                        <p className="text-sm opacity-70">Address</p>
                        <p className="font-semibold">{startup.companyContactInfo.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Team Members */}
        {startup.team && startup.team.length > 0 && (
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="text-2xl font-bold mb-4">Team</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {startup.team.map((member, index) => (
                  <div key={index} className="card bg-base-300 hover:bg-base-300/80 transition-all">
                    <div className="card-body p-4">
                      <div className="flex items-start gap-3">
                        {/* Avatar Circle with Initials */}
                        <div className="avatar">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg ring-2 ring-primary/20 leading-none">
                            <span className="flex items-center justify-center w-full h-full">
                              {getInitials(member.name)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{member.name}</h3>
                          <p className="text-sm opacity-70 mt-1">{member.designation}</p>
                          {member.linkedinUrl && (
                            <a
                              href={member.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link link-primary text-xs mt-2 inline-flex items-center gap-1"
                            >
                              <ExternalLink className="size-3" />
                              LinkedIn
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Roadmap */}
        {startup.roadmap && startup.roadmap.length > 0 && (
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="text-2xl font-bold mb-4">Development Roadmap</h2>
              <div className="space-y-4">
                {startup.roadmap.map((item, index) => {
                  // Get the milestone name - prioritize phase, then title
                  const milestoneName = item.phase || item.title || `Milestone ${index + 1}`;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{milestoneName}</span>
                        <span className="text-sm opacity-70">{item.progress || 0}%</span>
                      </div>
                      <progress
                        className="progress progress-primary w-full"
                        value={item.progress || 0}
                        max="100"
                      />
                      {(item.startDate || item.endDate) && (
                        <div className="text-xs opacity-60 mt-1">
                          {item.startDate && (
                            <span>
                              Start: {new Date(item.startDate).toLocaleDateString()}
                            </span>
                          )}
                          {item.startDate && item.endDate && " • "}
                          {item.endDate && (
                            <span>
                              End: {new Date(item.endDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="text-2xl font-bold mb-4">
              Reviews ({stats.reviews || 0})
            </h2>

            {/* Add Review Form */}
            {authUser && authUser._id !== startup.owner?._id && (
              <form onSubmit={handleReviewSubmit} className="mb-6 p-4 bg-base-300 rounded-lg">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Rating:</span>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating })}
                        className={`btn btn-sm btn-ghost ${reviewForm.rating >= rating ? "text-yellow-500" : ""
                          }`}
                      >
                        <Star
                          className={`size-5 ${reviewForm.rating >= rating ? "fill-yellow-500" : ""
                            }`}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    className="textarea textarea-bordered w-full placeholder:opacity-40"
                    placeholder="Write your review..."
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, comment: e.target.value })
                    }
                    rows="3"
                  />
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={reviewMutation.isPending}
                  >
                    {reviewMutation.isPending ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="size-4 mr-1" />
                        Submit Review
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            {reviews && reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((review) => (
                  <div key={review._id} className="card bg-base-300">
                    <div className="card-body p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1 overflow-hidden">
                              {review.user?.profilePic && review.user.profilePic.trim() ? (
                                <img
                                  src={review.user.profilePic}
                                  alt={review.user.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm w-full h-full">
                                  {review.user?.fullName?.charAt(0) || review.user?.username?.charAt(0) || "U"}
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold">
                              {review.user?.fullName || `@${review.user?.username}`}
                            </p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`size-4 ${i < review.rating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-400"
                                    }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        {review.createdAt && (
                          <span className="text-xs opacity-70">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {review.comment && (
                        <div className="mt-3">
                          <p className="opacity-80">{review.comment}</p>
                          {/* Sentiment Analysis Badge */}
                          {review.sentimentLabel && (
                            <div className="mt-2">
                              <span
                                className={`badge badge-sm ${review.sentimentLabel === "positive"
                                  ? "badge-success"
                                  : review.sentimentLabel === "negative"
                                    ? "badge-error"
                                    : "badge-warning"
                                  }`}
                                title={`Sentiment Score: ${review.sentimentScore || 0}`}
                              >
                                {review.sentimentLabel === "positive"
                                  ? "😊 Positive"
                                  : review.sentimentLabel === "negative"
                                    ? "😞 Negative"
                                    : "😐 Neutral"}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 opacity-70">
                <MessageSquare className="size-12 mx-auto mb-2 opacity-30" />
                <p>No reviews yet. Be the first to review!</p>
              </div>
            )}
          </div>
        </div>

        {/* Investment Stats (for founders) */}
        {investmentsData && investmentsData.investments.length > 0 && (
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="text-2xl font-bold mb-4">Investment Commitments</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="stat bg-base-300 rounded-lg">
                  <div className="stat-title">Total Committed</div>
                  <div className="stat-value text-success text-2xl">
                    ₹{investmentsData.stats.totalCommitted.toLocaleString()}
                  </div>
                </div>
                <div className="stat bg-base-300 rounded-lg">
                  <div className="stat-title">Pending</div>
                  <div className="stat-value text-warning text-2xl">
                    ₹{investmentsData.stats.totalPending.toLocaleString()}
                  </div>
                </div>
                <div className="stat bg-base-300 rounded-lg">
                  <div className="stat-title">Investors</div>
                  <div className="stat-value text-2xl">{investmentsData.stats.total}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Investment Modal */}
      <InvestmentModal
        isOpen={investmentModalOpen}
        onClose={() => setInvestmentModalOpen(false)}
        startup={startup}
        founderName={startup.owner?.fullName}
      />
    </div>
  );
};

export default StartupDetailPage;

