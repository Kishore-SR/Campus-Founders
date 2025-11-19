import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthUser from "../hooks/useAuthUser";
import { getMyStartup, getApprovedStartups, getStartupById } from "../lib/startup-api";
import { getStartupInvestments, updateInvestmentStatus, getMyInvestments } from "../lib/investment-api";
import { axiosInstance } from "../lib/axios";
import { getStreamToken } from "../lib/api";
import { Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { useThemeStore } from "../store/useThemeStore";
import {
  Plus,
  TrendingUp,
  Users,
  DollarSign,
  Star,
  MessageSquare,
  Edit,
  CheckCircle,
  XCircle,
  ArrowUp,
  Building2,
  PieChart,
  BarChart3,
  Calendar,
  ExternalLink,
  Clock,
  AlertCircle,
  MessageSquareIcon,
  VideoIcon,
} from "lucide-react";
import { StreamChat } from "stream-chat";
import PageLoader from "../components/PageLoader";
import StartupFormModal from "../components/StartupFormModal";
import MetricsEditModal from "../components/MetricsEditModal";
import ConfirmModal from "../components/ConfirmModal";
import EditProfileModal from "../components/EditProfileModal";
import toast from "react-hot-toast";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// Get initials from name (first letter of first name + first letter of last name)
const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ").filter(part => part.length > 0);
  if (parts.length >= 2) {
    const firstInitial = parts[0]?.[0]?.toUpperCase() || "";
    const lastInitial = parts[parts.length - 1]?.[0]?.toUpperCase() || "";
    return (firstInitial + lastInitial) || "U";
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase() || "U";
};

const ProfilePage = () => {
  const { authUser } = useAuthUser();
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    investmentId: null,
    status: null,
  });

  // Fetch startup if user is a student
  const {
    data: startupData,
    isLoading,
    error: _error,
  } = useQuery({
    queryKey: ["myStartup"],
    queryFn: getMyStartup,
    enabled: authUser?.role === "student",
    retry: false,
    refetchOnWindowFocus: false, // Prevent refetch when switching tabs
    refetchOnReconnect: false,
  });

  const startup = startupData?.startup;
  const stats = startupData?.stats;

  // Fetch investments for startup
  const { data: investmentsData } = useQuery({
    queryKey: ["startupInvestments", startup?._id],
    queryFn: () => getStartupInvestments(startup._id),
    enabled: !!startup && authUser?.role === "student",
    refetchOnWindowFocus: false, // Prevent refetch when switching tabs
    refetchOnReconnect: false,
  });

  // Fetch Stream token for video calls
  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  // Video call handler
  const handleVideoCall = async (user) => {
    // TODO: Revert to actual implementation when video call limits are resolved
    // Demo video call link - open in new tab with actual username
    const userId = authUser?.username || authUser?.fullName?.replace(/\s+/g, "_") || authUser?._id || "User";
    const demoCallUrl = `https://getstream.io/video/demos/join/JRcWJUMVmWdqGYdRqIr5g?user_id=${encodeURIComponent(userId)}`;
    window.open(demoCallUrl, "_blank");
    toast.success("Opening demo video call...");

    /* COMMENTED OUT - Actual implementation (to revert later)
    if (!user || !user._id || !user.username) {
      toast.error("Cannot start call with invalid user");
      return;
    }

    if (!authUser || !tokenData?.token) {
      toast.error("You need to be logged in to start a call");
      return;
    }

    try {
      const client = StreamChat.getInstance(STREAM_API_KEY);

      await client.connectUser(
        {
          id: authUser._id,
          name: authUser.fullName || authUser.username,
          image: authUser.profilePic,
        },
        tokenData.token
      );

      // Create channel ID same way as in ChatPage
      const channelId = [authUser._id, user._id].sort().join("-");

      // Create the call URL
      const callUrl = `${window.location.origin}/call/${channelId}`;

      // Create a temporary channel to send the message
      const channel = client.channel("messaging", channelId, {
        members: [authUser._id, user._id],
      });

      await channel.watch();

      // Send the call link message
      await channel.sendMessage({
        text: `I've started a video call. Join here: \n ${callUrl}`,
      });

      // Show success toast with user's name
      toast.success(
        `Video call started! Share this link with ${user.fullName || user.username}`
      );
      // Open the call in a new window/tab
      window.open(callUrl, "_blank");

      // Clean up
      await client.disconnectUser();
    } catch (error) {
      console.error("Error starting video call:", error);
      toast.error("Could not start video call. Please try again.");
    }
    */
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({ investmentId, status }) =>
      updateInvestmentStatus(investmentId, status),
    onSuccess: () => {
      toast.success("Investment status updated");
      queryClient.invalidateQueries(["startupInvestments"]);
      setConfirmModal({ isOpen: false, investmentId: null, status: null });
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  const handleStatusUpdate = (investmentId, status) => {
    setConfirmModal({
      isOpen: true,
      investmentId,
      status,
    });
  };

  const confirmStatusUpdate = () => {
    if (confirmModal.investmentId && confirmModal.status) {
      updateStatusMutation.mutate({
        investmentId: confirmModal.investmentId,
        status: confirmModal.status,
      });
    }
  };

  return (
    <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8" data-theme={theme}>
      <Helmet>
        <title>Profile | Campus Founders</title>
      </Helmet>

      {isLoading && !isModalOpen && !isMetricsModalOpen ? (
        <PageLoader />
      ) : (
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Profile Header */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="avatar">
                  <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                    {authUser?.profilePic && authUser.profilePic.trim() ? (
                      <img
                        src={authUser.profilePic}
                        alt={authUser?.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-3xl w-full h-full">
                        <span className="flex items-center justify-center w-full h-full">
                          {getInitials(authUser?.fullName || authUser?.username || "U")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold">{authUser?.fullName || authUser?.username}</h1>
                      <p className="text-lg opacity-70">@{authUser?.username}</p>
                      <div className="badge badge-primary badge-lg mt-2">
                        {authUser?.role === "student" && "🎓 Student Founder"}
                        {authUser?.role === "investor" && "💼 Investor"}
                        {authUser?.role === "normal" && "👤 Community Member"}
                      </div>
                      {authUser?.bio && (
                        <p className="mt-4 opacity-80">{authUser.bio}</p>
                      )}
                    </div>
                    {/* Edit Profile Button */}
                    <button
                      onClick={() => setIsEditProfileModalOpen(true)}
                      className="btn btn-primary btn-sm"
                    >
                      <Edit className="size-4 mr-1" />
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Student Founder - Startup Dashboard */}
          {authUser?.role === "student" && (
            <>
              {!startup ? (
                <div className="card bg-base-200 shadow-xl">
                  <div className="card-body text-center">
                    <Plus className="size-16 mx-auto text-primary opacity-50" />
                    <h2 className="text-2xl font-bold">Create Your Startup</h2>
                    <p className="opacity-70">
                      Share your vision with investors and the community
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="btn btn-primary mt-4"
                    >
                      <Plus className="size-5 mr-2" />
                      Create Startup Profile
                    </button>
                  </div>
                </div>
              ) : startup ? (
                <>
                  {/* Startup Info Card */}
                  <div className="card bg-base-200 shadow-xl">
                    <div className="card-body">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="flex gap-4 items-start">
                          {startup.logo && (
                            <div className="avatar">
                              <div className="w-20 rounded-lg">
                                <img src={startup.logo} alt={startup.name} />
                              </div>
                            </div>
                          )}
                          <div>
                            <h2 className="text-2xl font-bold">{startup.name}</h2>
                            <p className="text-lg opacity-70">{startup.tagline}</p>
                            <div className="flex gap-2 mt-2">
                              <div className="badge badge-accent">{startup.category}</div>
                              <div className="badge badge-outline">{startup.stage}</div>
                              <div
                                className={`badge ${startup.status === "approved"
                                  ? "badge-success"
                                  : startup.status === "pending"
                                    ? "badge-warning"
                                    : startup.status === "rejected"
                                      ? "badge-error"
                                      : "badge-ghost"
                                  }`}
                              >
                                {startup.status.toUpperCase()}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setIsModalOpen(true)}
                            className="btn btn-sm btn-outline"
                          >
                            <Edit className="size-4 mr-1" />
                            Edit
                          </button>
                          {startup.status === "approved" && (
                            <button
                              onClick={() => setIsMetricsModalOpen(true)}
                              className="btn btn-sm btn-primary"
                            >
                              <TrendingUp className="size-4 mr-1" />
                              Update Metrics
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Company Registration Details */}
                  {(startup.mobileNumber || startup.companyRegisteredLocation || startup.companyType || startup.fundingRound || startup.numberOfEmployees || startup.companyContactInfo) && (
                    <div className="card bg-base-200 shadow-xl">
                      <div className="card-body">
                        <h3 className="text-xl font-bold mb-4">Company Registration Details</h3>
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
                          {startup.numberOfEmployees !== undefined && startup.numberOfEmployees !== null && (
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

                  {/* Metrics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="card bg-base-200 shadow-lg">
                      <div className="card-body">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm opacity-70">Revenue</p>
                            <p className="text-2xl font-bold">
                              ₹{startup.revenue?.toLocaleString() || 0}
                            </p>
                          </div>
                          <DollarSign className="size-8 text-success" />
                        </div>
                      </div>
                    </div>

                    <div className="card bg-base-200 shadow-lg">
                      <div className="card-body">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm opacity-70">Users</p>
                            <p className="text-2xl font-bold">
                              {startup.users?.toLocaleString() || 0}
                            </p>
                          </div>
                          <Users className="size-8 text-info" />
                        </div>
                      </div>
                    </div>

                    <div className="card bg-base-200 shadow-lg">
                      <div className="card-body">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm opacity-70">Upvotes</p>
                            <p className="text-2xl font-bold">{stats?.upvotes || 0}</p>
                          </div>
                          <TrendingUp className="size-8 text-warning" />
                        </div>
                      </div>
                    </div>

                    <div className="card bg-base-200 shadow-lg">
                      <div className="card-body">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm opacity-70">Rating</p>
                            <p className="text-2xl font-bold">
                              {stats?.avgRating || "0.0"} <Star className="inline size-5 text-yellow-500" />
                            </p>
                            <p className="text-xs opacity-60">{stats?.reviews || 0} reviews</p>
                          </div>
                          <MessageSquare className="size-8 text-primary" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Roadmap Section */}
                  {startup.roadmap && startup.roadmap.length > 0 && (
                    <div className="card bg-base-200 shadow-xl">
                      <div className="card-body">
                        <h3 className="text-xl font-bold mb-4">Development Roadmap</h3>
                        <div className="space-y-4">
                          {startup.roadmap.map((item, index) => {
                            const milestoneName = item.title || item.phase || `Milestone ${index + 1}`;
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
                                ></progress>
                                {(item.startDate || item.endDate) && (
                                  <div className="text-xs opacity-60">
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

                  {/* Milestone Deadlines Section */}
                  {investmentsData && investmentsData.investments.length > 0 && (
                    (() => {
                      const investmentsWithDeadlines = investmentsData.investments.filter(
                        (inv) => inv.deadlineEndDate && (inv.status === "committed" || inv.status === "active")
                      );

                      if (investmentsWithDeadlines.length > 0) {
                        return (
                          <div className="card bg-base-200 shadow-xl">
                            <div className="card-body">
                              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Clock className="size-5" />
                                Upcoming Milestone Deadlines
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {investmentsWithDeadlines.map((investment) => {
                                  const calculateTimeRemaining = () => {
                                    if (!investment.deadlineEndDate) return null;

                                    const endDate = new Date(investment.deadlineEndDate);
                                    if (investment.deadlineTime) {
                                      const [hours, minutes] = investment.deadlineTime.split(':');
                                      endDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                                    }

                                    const now = new Date();
                                    const diff = endDate - now;

                                    if (diff < 0) {
                                      return { expired: true, days: 0, hours: 0, minutes: 0 };
                                    }

                                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

                                    return { expired: false, days, hours, minutes, totalHours: diff / (1000 * 60 * 60) };
                                  };

                                  const timeRemaining = calculateTimeRemaining();
                                  if (!timeRemaining) return null;

                                  const getColorClass = () => {
                                    if (timeRemaining.expired) return "border-error bg-error/10";
                                    if (timeRemaining.totalHours <= 48) return "border-error bg-error/10";
                                    if (timeRemaining.totalHours <= 168) return "border-warning bg-warning/10";
                                    return "border-success bg-success/10";
                                  };

                                  const getStatusText = () => {
                                    if (timeRemaining.expired) return "Deadline Passed";
                                    if (timeRemaining.days === 0 && timeRemaining.hours === 0) {
                                      return `${timeRemaining.minutes} Minutes Left`;
                                    }
                                    if (timeRemaining.days === 0) {
                                      return `${timeRemaining.hours} Hours Left`;
                                    }
                                    return `${timeRemaining.days} Day${timeRemaining.days !== 1 ? 's' : ''} Left`;
                                  };

                                  return (
                                    <div
                                      key={investment._id}
                                      className={`card border-2 ${getColorClass()}`}
                                    >
                                      <div className="card-body p-4">
                                        <div className="flex items-start justify-between mb-2">
                                          <div className="flex-1">
                                            <p className="font-bold text-sm">{investment.investor.fullName}</p>
                                            <p className="text-xs opacity-70">{investment.milestone || "Milestone"}</p>
                                          </div>
                                          <div className={`badge ${timeRemaining.expired ? 'badge-error' : timeRemaining.totalHours <= 48 ? 'badge-error' : timeRemaining.totalHours <= 168 ? 'badge-warning' : 'badge-success'}`}>
                                            {getStatusText()}
                                          </div>
                                        </div>
                                        <div className="text-xs opacity-70 mt-2">
                                          <p>Amount: ₹{investment.amount.toLocaleString()}</p>
                                          <p>Deadline: {new Date(investment.deadlineEndDate).toLocaleDateString()}</p>
                                          {investment.deadlineTime && (
                                            <p>Time: {investment.deadlineTime}</p>
                                          )}
                                        </div>
                                        {timeRemaining.expired && (
                                          <div className="alert alert-error alert-sm mt-2">
                                            <AlertCircle className="size-4" />
                                            <span className="text-xs">Submit report to investor</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()
                  )}

                  {/* Investments Section */}
                  {investmentsData && investmentsData.investments.length > 0 && (
                    <div className="card bg-base-200 shadow-xl">
                      <div className="card-body">
                        <h3 className="text-xl font-bold mb-4">Investment Commitments</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="stat bg-base-300 rounded-lg">
                            <div className="stat-title">Total Committed</div>
                            <div className="stat-value text-success">
                              ₹{investmentsData.stats.totalCommitted.toLocaleString()}
                            </div>
                          </div>
                          <div className="stat bg-base-300 rounded-lg">
                            <div className="stat-title">Pending</div>
                            <div className="stat-value text-warning">
                              ₹{investmentsData.stats.totalPending.toLocaleString()}
                            </div>
                          </div>
                          <div className="stat bg-base-300 rounded-lg">
                            <div className="stat-title">Investors</div>
                            <div className="stat-value">
                              {(() => {
                                const uniqueInvestors = new Set(
                                  investmentsData.investments.map(
                                    (inv) => inv.investor._id || inv.investor
                                  )
                                );
                                return uniqueInvestors.size;
                              })()}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {(() => {
                            // Group investments by investor
                            const groupedInvestments = {};
                            investmentsData.investments.forEach((investment) => {
                              const investorId = investment.investor._id || investment.investor;
                              if (!groupedInvestments[investorId]) {
                                groupedInvestments[investorId] = {
                                  investor: investment.investor,
                                  investments: [],
                                };
                              }
                              groupedInvestments[investorId].investments.push(investment);
                            });

                            return Object.values(groupedInvestments).map((group, groupIndex) => {
                              const totalAmount = group.investments.reduce(
                                (sum, inv) => sum + inv.amount,
                                0
                              );
                              const _hasPending = group.investments.some(
                                (inv) => inv.status === "pending"
                              );

                              return (
                                <div key={groupIndex} className="card bg-base-300">
                                  <div className="card-body p-4">
                                    <div className="flex items-start justify-between mb-4">
                                      <div className="flex items-center gap-3 flex-1">
                                        <div className="avatar">
                                          <div className="w-14 h-14 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                                            {group.investor.profilePic && group.investor.profilePic.trim() ? (
                                              <img
                                                src={group.investor.profilePic}
                                                alt={group.investor.fullName}
                                                className="w-full h-full object-cover"
                                              />
                                            ) : (
                                              <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-base w-full h-full">
                                                {group.investor.fullName?.charAt(0) || group.investor.username?.charAt(0) || "I"}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex-1">
                                          <p className="font-bold text-lg">
                                            {group.investor.fullName}
                                          </p>
                                          <p className="text-sm opacity-70">
                                            {group.investor.firm}
                                          </p>
                                          <p className="text-xs opacity-60 mt-1">
                                            {group.investments.length} commitment{group.investments.length !== 1 ? 's' : ''}
                                          </p>
                                          {/* Chat and Video Call Buttons */}
                                          <div className="flex gap-2 mt-2">
                                            <Link
                                              to={`/chat/${group.investor._id || group.investor}`}
                                              className="btn btn-primary btn-sm"
                                            >
                                              <MessageSquareIcon className="h-4 w-4 mr-1" />
                                              Chat
                                            </Link>
                                            <button
                                              onClick={() => handleVideoCall(group.investor)}
                                              className="btn btn-outline btn-sm"
                                            >
                                              <VideoIcon className="h-4 w-4 mr-1" />
                                              Call
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-2xl font-bold text-success">
                                          ₹{totalAmount.toLocaleString()}
                                        </p>
                                        <p className="text-xs opacity-70">Total Investment</p>
                                      </div>
                                    </div>

                                    {/* Individual Investments */}
                                    <div className="space-y-4 mt-4 pt-4 border-t border-base-content/10">
                                      {group.investments.map((investment, index) => (
                                        <div
                                          key={investment._id}
                                          className="bg-base-200 rounded-lg p-4 border-2 border-base-content/20 shadow-lg relative"
                                        >
                                          {/* Number Badge */}
                                          <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold text-sm shadow-lg border-2 border-base-100 z-10">
                                            {index + 1}
                                          </div>

                                          {/* Amount and Status in same line */}
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 mt-2">
                                            {/* Investment Amount */}
                                            <div className="p-3 bg-base-100 rounded-lg border border-base-content/10">
                                              <div className="flex items-center gap-2 mb-2">
                                                <DollarSign className="size-5 text-primary" />
                                                <p className="font-semibold text-base">Amount</p>
                                              </div>
                                              <p className="text-base font-bold text-success">
                                                ₹{investment.amount.toLocaleString()}
                                              </p>
                                            </div>

                                            {/* Status */}
                                            <div className="p-3 bg-base-100 rounded-lg border border-base-content/10">
                                              <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle className={`size-5 ${investment.status === "committed"
                                                  ? "text-success"
                                                  : investment.status === "rejected"
                                                    ? "text-error"
                                                    : "text-warning"
                                                  }`} />
                                                <p className="font-semibold text-base">Status</p>
                                              </div>
                                              <div
                                                className={`badge px-4 py-2 text-base font-semibold ${investment.status === "committed"
                                                  ? "badge-success"
                                                  : investment.status === "rejected"
                                                    ? "badge-error"
                                                    : "badge-warning"
                                                  }`}
                                              >
                                                {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                                              </div>
                                            </div>
                                          </div>

                                          {/* Milestone and Deadline in same line */}
                                          {(investment.milestone || investment.deadlineEndDate) && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                              {/* Milestone */}
                                              {investment.milestone && (
                                                <div className="p-3 bg-base-100 rounded-lg border border-base-content/10">
                                                  <div className="flex items-center gap-2 mb-2">
                                                    <TrendingUp className="size-5 text-primary" />
                                                    <p className="font-semibold text-base">Milestone</p>
                                                  </div>
                                                  <p className="text-base">
                                                    {investment.milestone}
                                                  </p>
                                                </div>
                                              )}

                                              {/* Deadline */}
                                              {investment.deadlineEndDate && (
                                                <div className="p-3 bg-base-100 rounded-lg border border-base-content/10">
                                                  <div className="flex items-center justify-between gap-3 mb-2">
                                                    <div className="flex items-center gap-2">
                                                      <Calendar className="size-5 text-primary" />
                                                      <p className="font-semibold text-base">Deadline</p>
                                                    </div>
                                                    {(() => {
                                                      const endDate = new Date(investment.deadlineEndDate);
                                                      const now = new Date();
                                                      const diff = endDate - now;
                                                      if (diff > 0) {
                                                        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                                        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                                        const totalHours = diff / (1000 * 60 * 60);
                                                        let colorClass = "text-success";
                                                        let bgClass = "bg-success/10 border-success";
                                                        if (totalHours <= 48) {
                                                          colorClass = "text-error";
                                                          bgClass = "bg-error/10 border-error";
                                                        } else if (totalHours <= 168) {
                                                          colorClass = "text-warning";
                                                          bgClass = "bg-warning/10 border-warning";
                                                        }
                                                        return (
                                                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded ${bgClass} border`}>
                                                            <Clock className={`size-4 ${colorClass}`} />
                                                            <p className={`font-bold text-base ${colorClass}`}>
                                                              {days > 0
                                                                ? `${days} Day${days !== 1 ? 's' : ''} Left`
                                                                : `${hours} Hour${hours !== 1 ? 's' : ''} Left`}
                                                            </p>
                                                          </div>
                                                        );
                                                      }
                                                      return (
                                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-error/10 border border-error">
                                                          <AlertCircle className="size-4 text-error" />
                                                          <p className="font-bold text-base text-error">
                                                            Passed
                                                          </p>
                                                        </div>
                                                      );
                                                    })()}
                                                  </div>
                                                  <p className="text-base">
                                                    {new Date(investment.deadlineEndDate).toLocaleDateString('en-US', {
                                                      weekday: 'long',
                                                      year: 'numeric',
                                                      month: 'long',
                                                      day: 'numeric'
                                                    })}
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                          )}

                                          {/* Message */}
                                          {investment.message && (
                                            <div className="mb-3 p-3 bg-base-100 rounded-lg border border-base-content/10">
                                              <div className="flex items-center gap-2 mb-2">
                                                <MessageSquare className="size-5 text-primary" />
                                                <p className="font-semibold text-base">Message</p>
                                              </div>
                                              <p className="text-base opacity-90">
                                                "{investment.message}"
                                              </p>
                                            </div>
                                          )}

                                          {investment.status === "pending" && (
                                            <div className="card-actions justify-end mt-3">
                                              <button
                                                onClick={() =>
                                                  handleStatusUpdate(investment._id, "committed")
                                                }
                                                className="btn btn-success btn-sm"
                                              >
                                                <CheckCircle className="size-4 mr-1" />
                                                Accept
                                              </button>
                                              <button
                                                onClick={() =>
                                                  handleStatusUpdate(investment._id, "rejected")
                                                }
                                                className="btn btn-error btn-sm"
                                              >
                                                <XCircle className="size-4 mr-1" />
                                                Decline
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </>
          )}

          {/* Investor Profile */}
          {authUser?.role === "investor" && (
            <InvestorDashboard authUser={authUser} />
          )}

          {/* Normal User Profile */}
          {authUser?.role === "normal" && (
            <UserActivitySection userId={authUser._id} />
          )}
        </div>
      )}

      {/* Startup Form Modal - Always available */}
      <StartupFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        existingStartup={startup}
      />

      {/* Metrics Edit Modal - Always available */}
      <MetricsEditModal
        isOpen={isMetricsModalOpen}
        onClose={() => setIsMetricsModalOpen(false)}
        startup={startup}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, investmentId: null, status: null })}
        onConfirm={confirmStatusUpdate}
        title={
          confirmModal.status === "committed"
            ? "Accept Investment?"
            : "Reject Investment?"
        }
        message={
          confirmModal.status === "committed"
            ? "Are you sure you want to accept this investment commitment?"
            : "Are you sure you want to reject this investment commitment?"
        }
        confirmText={confirmModal.status === "committed" ? "Accept" : "Reject"}
        cancelText="Cancel"
        type={confirmModal.status === "committed" ? "success" : "error"}
        isPending={updateStatusMutation.isPending}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
      />
    </div>
  );
};

// Startup Founder Info Component (for displaying founder info in investor dashboard)
const StartupFounderInfo = ({ startupId, handleVideoCall }) => {
  const { data: startupResponse } = useQuery({
    queryKey: ["startup", startupId],
    queryFn: () => getStartupById(startupId),
    enabled: !!startupId,
  });

  const founder = startupResponse?.startup?.owner;

  if (!founder) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 mb-2 p-2 bg-base-200 rounded-lg">
      <div className="avatar">
        <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1 overflow-hidden">
          {founder.profilePic && founder.profilePic.trim() ? (
            <img
              src={founder.profilePic}
              alt={founder.fullName || founder.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm w-full h-full">
              {founder.fullName?.charAt(0) || founder.username?.charAt(0) || "U"}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm">
          {founder.fullName || `@${founder.username}`}
        </p>
        <p className="text-xs opacity-70">Founder</p>
      </div>
      {/* Chat and Video Call Buttons */}
      <div className="flex gap-2">
        <Link
          to={`/chat/${founder._id || founder}`}
          className="btn btn-primary btn-xs"
        >
          <MessageSquareIcon className="h-3 w-3 mr-1" />
          Chat
        </Link>
        <button
          onClick={() => handleVideoCall(founder)}
          className="btn btn-outline btn-xs"
        >
          <VideoIcon className="h-3 w-3 mr-1" />
          Call
        </button>
      </div>
    </div>
  );
};

// Investor Dashboard Component
const InvestorDashboard = ({ authUser }) => {
  const { theme: _theme } = useThemeStore();
  const { data: investments, isLoading } = useQuery({
    queryKey: ["myInvestments"],
    queryFn: getMyInvestments,
    enabled: authUser?.role === "investor",
  });

  // Fetch Stream token for video calls
  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  // Video call handler for Investor Dashboard
  const handleVideoCall = async (user) => {
    // TODO: Revert to actual implementation when video call limits are resolved
    // Demo video call link - open in new tab with actual username
    const userId = authUser?.username || authUser?.fullName?.replace(/\s+/g, "_") || authUser?._id || "User";
    const demoCallUrl = `https://getstream.io/video/demos/join/JRcWJUMVmWdqGYdRqIr5g?user_id=${encodeURIComponent(userId)}`;
    window.open(demoCallUrl, "_blank");
    toast.success("Opening demo video call...");

    /* COMMENTED OUT - Actual implementation (to revert later)
    if (!user || !user._id || !user.username) {
      toast.error("Cannot start call with invalid user");
      return;
    }

    if (!authUser || !tokenData?.token) {
      toast.error("You need to be logged in to start a call");
      return;
    }

    try {
      const client = StreamChat.getInstance(STREAM_API_KEY);

      await client.connectUser(
        {
          id: authUser._id,
          name: authUser.fullName || authUser.username,
          image: authUser.profilePic,
        },
        tokenData.token
      );

      // Create channel ID same way as in ChatPage
      const channelId = [authUser._id, user._id].sort().join("-");

      // Create the call URL
      const callUrl = `${window.location.origin}/call/${channelId}`;

      // Create a temporary channel to send the message
      const channel = client.channel("messaging", channelId, {
        members: [authUser._id, user._id],
      });

      await channel.watch();

      // Send the call link message
      await channel.sendMessage({
        text: `I've started a video call. Join here: \n ${callUrl}`,
      });

      // Show success toast with user's name
      toast.success(
        `Video call started! Share this link with ${user.fullName || user.username}`
      );
      // Open the call in a new window/tab
      window.open(callUrl, "_blank");

      // Clean up
      await client.disconnectUser();
    } catch (error) {
      console.error("Error starting video call:", error);
      toast.error("Could not start video call. Please try again.");
    }
    */
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (!investments || investments.length === 0) {
    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body text-center">
          <Building2 className="size-16 mx-auto text-primary opacity-50 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Investments Yet</h2>
          <p className="opacity-70 mb-4">
            Start exploring startups and make your first investment commitment
          </p>
          <Link to="/startups" className="btn btn-primary">
            Explore Startups
          </Link>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    totalInvested: investments.reduce((sum, inv) => {
      if (inv.status === "committed" || inv.status === "active") {
        return sum + (inv.amount || 0);
      }
      return sum;
    }, 0),
    totalPending: investments.reduce((sum, inv) => {
      if (inv.status === "pending") {
        return sum + (inv.amount || 0);
      }
      return sum;
    }, 0),
    totalStartups: new Set(investments.map((inv) => inv.startup?._id)).size,
    totalInvestments: investments.length,
    committedCount: investments.filter((inv) => inv.status === "committed" || inv.status === "active").length,
    pendingCount: investments.filter((inv) => inv.status === "pending").length,
    rejectedCount: investments.filter((inv) => inv.status === "rejected").length,
  };

  // Group by category
  const categoryData = {};
  investments.forEach((inv) => {
    const category = inv.startup?.category || "other";
    if (!categoryData[category]) {
      categoryData[category] = { count: 0, amount: 0 };
    }
    categoryData[category].count++;
    if (inv.status === "committed" || inv.status === "active") {
      categoryData[category].amount += inv.amount || 0;
    }
  });

  // Group by status
  const statusData = {
    committed: investments.filter((inv) => inv.status === "committed" || inv.status === "active").length,
    pending: investments.filter((inv) => inv.status === "pending").length,
    rejected: investments.filter((inv) => inv.status === "rejected").length,
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "committed":
      case "active":
        return "badge-success";
      case "pending":
        return "badge-warning";
      case "rejected":
        return "badge-error";
      default:
        return "badge-ghost";
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case "committed":
        return "Committed";
      case "active":
        return "Active";
      case "pending":
        return "Pending";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Building2 className="size-8 text-primary" />
            Investment Portfolio
          </h2>
          <p className="opacity-70">Track and manage your startup investments</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70">Total Invested</p>
                <p className="text-2xl font-bold text-success">
                  ₹{stats.totalInvested.toLocaleString()}
                </p>
              </div>
              <DollarSign className="size-8 text-success" />
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70">Pending Commitments</p>
                <p className="text-2xl font-bold text-warning">
                  ₹{stats.totalPending.toLocaleString()}
                </p>
              </div>
              <Calendar className="size-8 text-warning" />
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70">Startups Invested</p>
                <p className="text-2xl font-bold">{stats.totalStartups}</p>
              </div>
              <Building2 className="size-8 text-info" />
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-70">Total Investments</p>
                <p className="text-2xl font-bold">{stats.totalInvestments}</p>
              </div>
              <TrendingUp className="size-8 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <PieChart className="size-5" />
              Investment Status
            </h3>
            <div className="space-y-4">
              {Object.entries(statusData).map(([status, count]) => {
                if (count === 0) return null;
                const total = Object.values(statusData).reduce((a, b) => a + b, 0);
                const percentage = (count / total) * 100;
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold capitalize">{getStatusLabel(status)}</span>
                      <span className="text-sm opacity-70">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <progress
                      className={`progress w-full ${getStatusColor(status).replace("badge-", "progress-")}`}
                      value={percentage}
                      max="100"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="size-5" />
              Investments by Category
            </h3>
            <div className="space-y-4">
              {Object.entries(categoryData)
                .sort((a, b) => b[1].amount - a[1].amount)
                .map(([category, data]) => {
                  const maxAmount = Math.max(...Object.values(categoryData).map((d) => d.amount));
                  const percentage = maxAmount > 0 ? (data.amount / maxAmount) * 100 : 0;
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold capitalize">{category}</span>
                        <span className="text-sm opacity-70">
                          {data.count} startup{data.count !== 1 ? "s" : ""} • ₹{data.amount.toLocaleString()}
                        </span>
                      </div>
                      <progress
                        className="progress progress-primary w-full"
                        value={percentage}
                        max="100"
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Investment List */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Building2 className="size-5" />
            All Investments ({investments.length})
          </h3>
          <div className="space-y-4">
            {investments.map((investment) => (
              <div
                key={investment._id}
                className="card bg-base-300 hover:bg-base-300/80 transition-all"
              >
                <div className="card-body p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {investment.startup?.logo && (
                        <div className="avatar">
                          <div className="w-16 h-16 rounded-lg">
                            <img
                              src={investment.startup.logo}
                              alt={investment.startup.name}
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            to={`/startups/${investment.startup?._id}`}
                            className="text-xl font-bold hover:text-primary transition-colors"
                          >
                            {investment.startup?.name || "Unknown Startup"}
                          </Link>
                          <ExternalLink className="size-4 opacity-50" />
                        </div>
                        <p className="text-sm opacity-70 mb-2">
                          {investment.startup?.tagline || "No tagline"}
                        </p>
                        {/* Founder Info with Chat/Video Call Buttons */}
                        {investment.startup?._id && (
                          <StartupFounderInfo
                            startupId={investment.startup._id}
                            handleVideoCall={handleVideoCall}
                          />
                        )}
                        <div className="flex flex-wrap gap-2">
                          {investment.startup?.category && (
                            <div className="badge badge-primary badge-sm">
                              {investment.startup.category}
                            </div>
                          )}
                          {investment.startup?.stage && (
                            <div className="badge badge-outline badge-sm">
                              {investment.startup.stage}
                            </div>
                          )}
                          <div className={`badge px-4 py-2 text-base font-semibold ${getStatusColor(investment.status)}`}>
                            {getStatusLabel(investment.status)}
                          </div>
                        </div>
                        {/* Milestone and Deadline in same line */}
                        {(investment.milestone || investment.deadlineEndDate) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            {/* Milestone */}
                            {investment.milestone && (
                              <div className="p-3 bg-base-200 rounded-lg border border-base-content/10">
                                <div className="flex items-center gap-2 mb-2">
                                  <TrendingUp className="size-5 text-primary" />
                                  <p className="font-semibold text-base">Milestone</p>
                                </div>
                                <p className="text-base">
                                  {investment.milestone}
                                </p>
                              </div>
                            )}

                            {/* Deadline */}
                            {investment.deadlineEndDate && (
                              <div className="p-3 bg-base-200 rounded-lg border border-base-content/10">
                                <div className="flex items-center justify-between gap-3 mb-2">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="size-5 text-primary" />
                                    <p className="font-semibold text-base">Deadline</p>
                                  </div>
                                  {(() => {
                                    const endDate = new Date(investment.deadlineEndDate);
                                    const now = new Date();
                                    const diff = endDate - now;
                                    if (diff > 0) {
                                      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                      const totalHours = diff / (1000 * 60 * 60);
                                      let colorClass = "text-success";
                                      let bgClass = "bg-success/10 border-success";
                                      if (totalHours <= 48) {
                                        colorClass = "text-error";
                                        bgClass = "bg-error/10 border-error";
                                      } else if (totalHours <= 168) {
                                        colorClass = "text-warning";
                                        bgClass = "bg-warning/10 border-warning";
                                      }
                                      return (
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded ${bgClass} border`}>
                                          <Clock className={`size-4 ${colorClass}`} />
                                          <p className={`font-bold text-base ${colorClass}`}>
                                            {days > 0
                                              ? `${days} Day${days !== 1 ? 's' : ''} Left`
                                              : `${hours} Hour${hours !== 1 ? 's' : ''} Left`}
                                          </p>
                                        </div>
                                      );
                                    }
                                    return (
                                      <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-error/10 border border-error">
                                        <AlertCircle className="size-4 text-error" />
                                        <p className="font-bold text-base text-error">
                                          Passed
                                        </p>
                                      </div>
                                    );
                                  })()}
                                </div>
                                <p className="text-base">
                                  {new Date(investment.deadlineEndDate).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Message */}
                        {investment.message && (
                          <div className="mt-3 p-3 bg-base-200 rounded-lg border border-base-content/10">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="size-5 text-primary" />
                              <p className="font-semibold text-base">Message</p>
                            </div>
                            <p className="text-base opacity-90">
                              "{investment.message}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right md:text-left md:min-w-[200px]">
                      <p className="text-2xl font-bold text-success mb-1">
                        ₹{investment.amount?.toLocaleString() || 0}
                      </p>
                      {investment.createdAt && (
                        <p className="text-xs opacity-60">
                          {new Date(investment.createdAt).toLocaleDateString()}
                        </p>
                      )}
                      {investment.status === "pending" && (
                        <p className="text-xs text-warning mt-1">
                          Awaiting founder approval
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// User Activity Section Component
const UserActivitySection = ({ userId }) => {

  // Fetch all approved startups to check upvotes
  const { data: allStartups } = useQuery({
    queryKey: ["allStartups"],
    queryFn: () => getApprovedStartups({}),
  });

  // Fetch user's reviews
  const { data: userReviews } = useQuery({
    queryKey: ["userReviews", userId],
    queryFn: async () => {
      // Get all startups and their reviews to find user's reviews
      const reviewsData = [];
      if (allStartups) {
        for (const startup of allStartups) {
          try {
            const response = await axiosInstance.get(`/startups/${startup._id}`);
            const reviews = response.data.reviews || [];
            const userReview = reviews.find((r) => r.user?._id === userId);
            if (userReview) {
              reviewsData.push({
                ...userReview,
                startup: response.data.startup,
              });
            }
          } catch (error) {
            console.error(`Error fetching reviews for startup ${startup._id}:`, error);
          }
        }
      }
      return reviewsData;
    },
    enabled: !!allStartups && allStartups.length > 0,
  });

  // Get upvoted startups
  const upvotedStartups = allStartups?.filter((startup) =>
    startup.upvotes?.includes(userId)
  ) || [];

  return (
    <div className="space-y-6">
      {/* Upvoted Startups */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <ArrowUp className="size-6 text-yellow-500" />
            Upvoted Startups ({upvotedStartups.length})
          </h2>
          {upvotedStartups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upvotedStartups.map((startup) => (
                <Link
                  key={startup._id}
                  to={`/startups/${startup._id}`}
                  className="card bg-base-300 hover:bg-base-300/80 transition-all cursor-pointer"
                >
                  <div className="card-body p-4">
                    <div className="flex items-start gap-3">
                      {startup.logo && (
                        <div className="avatar">
                          <div className="w-12 h-12 rounded-lg">
                            <img src={startup.logo} alt={startup.name} />
                          </div>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg hover:text-primary">
                          {startup.name}
                        </h3>
                        <p className="text-sm opacity-70 line-clamp-2">
                          {startup.tagline}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <div className="badge badge-primary badge-sm">
                            {startup.category}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 opacity-70">
              <ArrowUp className="size-12 mx-auto mb-2 opacity-30" />
              <p>No upvoted startups yet. Start exploring and upvote startups you like!</p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="size-6 text-primary" />
            Your Reviews ({userReviews?.length || 0})
          </h2>
          {userReviews && userReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userReviews.map((review) => (
                <div key={review._id} className="card bg-base-300">
                  <div className="card-body p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Link
                        to={`/startups/${review.startup._id}`}
                        className="flex items-center gap-3 hover:text-primary"
                      >
                        {review.startup.logo && (
                          <div className="avatar">
                            <div className="w-10 h-10 rounded-lg">
                              <img src={review.startup.logo} alt={review.startup.name} />
                            </div>
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold">{review.startup.name}</h3>
                          <p className="text-sm opacity-70">{review.startup.tagline}</p>
                        </div>
                      </Link>
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
                    <p className="opacity-80 mt-2">{review.comment}</p>
                    {review.createdAt && (
                      <p className="text-xs opacity-60 mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 opacity-70">
              <MessageSquare className="size-12 mx-auto mb-2 opacity-30" />
              <p>No reviews yet. Share your thoughts on startups you've explored!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

