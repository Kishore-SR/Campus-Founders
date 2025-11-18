import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { getOutgoingFriendReqs, sendFriendRequest } from "../lib/api";
import { Helmet } from "react-helmet-async";
import { useThemeStore } from "../store/useThemeStore";
import useAuthUser from "../hooks/useAuthUser";
import {
  ShieldCheck,
  Briefcase,
  DollarSign,
  MapPin,
  Search,
  Filter,
  UserPlus,
  ExternalLink,
  CheckCircle,
  Clock,
  Linkedin,
} from "lucide-react";
import PageLoader from "../components/PageLoader";
import toast from "react-hot-toast";

const InvestorsPage = () => {
  const { theme } = useThemeStore();
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");

  // Fetch approved investors
  const { data: investors, isLoading } = useQuery({
    queryKey: ["approvedInvestors"],
    queryFn: async () => {
      const response = await axiosInstance.get("/users/investors");
      return response.data;
    },
  });

  // Fetch user's friends
  const { data: friends } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const response = await axiosInstance.get("/users/friends");
      return response.data;
    },
    enabled: !!authUser,
  });

  // Fetch outgoing friend requests
  const { data: outgoingRequests } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
    enabled: !!authUser,
  });

  const { mutate: sendRequestMutation } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      toast.success("Connection request sent!");
      queryClient.invalidateQueries(["outgoingFriendReqs"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send request");
    },
  });

  const handleSendRequest = (investorId) => {
    if (!authUser) {
      toast.error("Please login to send a connection request.");
      return;
    }
    sendRequestMutation(investorId);
  };

  // Helper function to get connection status
  const getConnectionStatus = (investorId) => {
    if (!authUser) return null;

    // Check if already connected (friends)
    const isConnected = friends?.some((friend) => friend._id === investorId);
    if (isConnected) return "connected";

    // Check if request is pending
    const isPending = outgoingRequests?.some(
      (req) => req.recipient === investorId || req.recipient?._id === investorId
    );
    if (isPending) return "pending";

    return null;
  };

  if (isLoading) return <PageLoader />;

  // Get unique domains from all investors
  const allDomains = [
    ...new Set(investors?.flatMap((inv) => inv.investmentDomains || [])),
  ];

  // Filter investors
  const filteredInvestors = investors?.filter((investor) => {
    const matchesSearch =
      investor.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      investor.firm?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDomain =
      !selectedDomain || investor.investmentDomains?.includes(selectedDomain);

    return matchesSearch && matchesDomain;
  });

  return (
    <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8" data-theme={theme}>
      <Helmet>
        <title>Verified Investors | Campus Founders</title>
        <meta
          name="description"
          content="Connect with verified investors on Campus Founders"
        />
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Verified Investors</h1>
          <p className="text-lg opacity-70">
            Connect with trusted investors backing innovation
          </p>
        </div>

        {/* Search and Filter */}
        <div className="card bg-base-200 border border-primary/25">
          <div className="card-body">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="form-control flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 opacity-50" />
                  <input
                    type="text"
                    placeholder="Search by name or firm..."
                    className="input input-bordered w-full pl-10 placeholder:opacity-40"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Domain Filter */}
              <div className="form-control md:w-64">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 opacity-50 pointer-events-none" />
                  <select
                    className="select select-bordered w-full pl-10"
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                  >
                    <option value="">All Domains</option>
                    {allDomains.map((domain) => (
                      <option key={domain} value={domain}>
                        {domain}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="text-sm opacity-70 mt-2">
              Showing {filteredInvestors?.length || 0} of {investors?.length || 0}{" "}
              verified investors
            </div>
          </div>
        </div>

        {/* Investors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvestors?.length === 0 ? (
            <div className="col-span-full card bg-base-200 border border-primary/25">
              <div className="card-body text-center">
                <p className="opacity-70">No investors found</p>
              </div>
            </div>
          ) : (
            filteredInvestors?.map((investor) => (
              <div
                key={investor._id}
                className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow border border-primary/25"
              >
                <div className="card-body">
                  {/* Profile */}
                  <div className="flex items-start gap-4">
                    <div className="avatar">
                      <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                        {investor.profilePic && investor.profilePic.trim() ? (
                          <img
                            src={investor.profilePic}
                            alt={investor.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold w-full h-full">
                            {investor.fullName?.charAt(0) || investor.username?.charAt(0) || "I"}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg">{investor.fullName}</h3>
                          <p className="text-sm opacity-70">@{investor.username}</p>
                        </div>
                        <div className="badge badge-success badge-sm gap-1">
                          <ShieldCheck className="size-3" />
                          Verified
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {investor.bio && (
                    <p className="text-sm line-clamp-2 mt-2">{investor.bio}</p>
                  )}

                  {/* Firm & Role */}
                  <div className="space-y-2 mt-3">
                    {investor.firm && (
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="size-4 text-primary" />
                        <span className="font-semibold">{investor.firm}</span>
                      </div>
                    )}

                    {investor.investorRole && (
                      <div className="flex items-center gap-2 text-sm opacity-70">
                        <span>{investor.investorRole}</span>
                      </div>
                    )}

                    {investor.ticketSize && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="size-4 text-success" />
                        <span>{investor.ticketSize}</span>
                      </div>
                    )}

                    {investor.location && (
                      <div className="flex items-center gap-2 text-sm opacity-70">
                        <MapPin className="size-4" />
                        <span>{investor.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Investment Domains */}
                  {investor.investmentDomains?.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs opacity-70 mb-2">Invests in:</div>
                      <div className="flex flex-wrap gap-1">
                        {investor.investmentDomains.slice(0, 3).map((domain, index) => (
                          <div key={index} className="badge badge-primary badge-sm">
                            {domain}
                          </div>
                        ))}
                        {investor.investmentDomains.length > 3 && (
                          <div className="badge badge-ghost badge-sm">
                            +{investor.investmentDomains.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="card-actions justify-between mt-4">
                    <div className="flex gap-2">
                      {investor.linkedinUrl && (
                        <a
                          href={investor.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm"
                          style={{ backgroundColor: '#0077B5', borderColor: '#0077B5', color: 'white' }}
                        >
                          <Linkedin className="size-4 mr-1" fill="currentColor" />
                          LinkedIn
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {authUser && authUser._id !== investor._id && (() => {
                        const status = getConnectionStatus(investor._id);
                        if (status === "connected") {
                          return (
                            <button className="btn btn-success btn-sm" disabled>
                              <CheckCircle className="size-4 mr-1" />
                              Connected
                            </button>
                          );
                        } else if (status === "pending") {
                          return (
                            <button className="btn btn-warning btn-sm" disabled>
                              <Clock className="size-4 mr-1" />
                              Pending
                            </button>
                          );
                        } else {
                          return (
                            <button
                              onClick={() => handleSendRequest(investor._id)}
                              className="btn btn-primary btn-sm"
                            >
                              <UserPlus className="size-4 mr-1" />
                              Connect
                            </button>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* CTA for Non-Investors (hide for students and normal users) */}
        {!authUser && (
          <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content">
            <div className="card-body text-center">
              <h2 className="text-2xl font-bold">Are you an investor?</h2>
              <p className="opacity-90">
                Join our verified investor network and connect with promising student
                founders
              </p>
              <div>
                <a href="/signup" className="btn btn-neutral mt-4">
                  Join as Investor
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestorsPage;

