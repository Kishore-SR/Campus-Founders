import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  acceptFriendRequest,
  getFriendRequests,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { getAIRecommendations } from "../lib/startup-api";
import { Link } from "react-router";
import {
  CheckCircleIcon,
  MapPinIcon,
  UserCheckIcon,
  UserPlusIcon,
  UsersIcon,
  InfoIcon,
  SearchIcon,
  Sparkles,
  TrendingUp,
  ExternalLink,
  Eye,
} from "lucide-react";

import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import { capitialize } from "../lib/utils";
import useAuthUser from "../hooks/useAuthUser";

// AI Recommendations Component
const AIRecommendationsSection = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["ai-recommendations"],
    queryFn: getAIRecommendations,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  const recommendations = data?.recommendations || [];

  if (recommendations.length === 0) {
    return (
      <div className="card bg-base-200 p-8 text-center border-2 border-dashed border-base-content/20">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-base-300 p-6">
            <Sparkles className="size-12 text-base-content/40" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-xl mb-2">
              No recommendations yet
            </h3>
            <p className="text-base-content opacity-70 max-w-md mx-auto">
              Complete your profile with investment interests to get personalized AI recommendations!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recommendations.map((startup) => (
        <div
          key={startup._id}
          className="card bg-base-200 hover:shadow-lg transition-all border border-base-300 hover:border-primary/50"
        >
          <div className="card-body p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-bold text-lg hover:text-primary cursor-pointer">
                  <Link to={`/startups/${startup._id}`}>{startup.name}</Link>
                </h3>
                <p className="text-sm opacity-70 line-clamp-2">{startup.tagline}</p>
              </div>
              {startup.logo && (
                <div className="avatar">
                  <div className="w-12 h-12 rounded-lg">
                    <img src={startup.logo} alt={startup.name} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="badge badge-primary badge-sm">{startup.category}</div>
              <div className="badge badge-outline badge-sm">{startup.stage}</div>
              {startup.compatibilityScore && (
                <div className="badge badge-success badge-sm">
                  <Sparkles className="size-3 mr-1" />
                  {startup.compatibilityScore}% Match
                </div>
              )}
            </div>

            <p className="text-sm opacity-80 line-clamp-2">
              {startup.description?.substring(0, 100)}...
            </p>

            <div className="flex gap-2 pt-2">
              <Link
                to={`/startups/${startup._id}`}
                className="btn btn-sm btn-primary flex-1"
              >
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
                  <ExternalLink className="size-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const HomePage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [incomingRequestsMap, setIncomingRequestsMap] = useState(new Map());
  const [sendingRequestIds, setSendingRequestIds] = useState(new Set());
  const [acceptingRequestIds, setAcceptingRequestIds] = useState(new Set());

  // Dynamic titles based on user role
  const getNetworkTitle = () => {
    if (authUser?.role === "student") return "Your Network";
    if (authUser?.role === "investor") return "Your Network";
    return "Your Network";
  };

  const getNetworkEmptyMessage = () => {
    if (authUser?.role === "student") return "Connect with investors who can help fund and grow your startup!";
    if (authUser?.role === "investor") return "Connect with innovative student founders and their startups!";
    return "Connect with passionate founders and investors below and build strong bonds!";
  };

  const getRecommendedTitle = () => {
    if (authUser?.role === "student") return "Discover Investors";
    if (authUser?.role === "investor") return "Discover Founders";
    return "Discover Community";
  };

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });
  const { mutate: sendRequestMutation } = useMutation({
    mutationFn: (userId) => {
      // Add the userId to the set of sending request IDs
      setSendingRequestIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(userId);
        return newSet;
      });
      return sendFriendRequest(userId);
    },
    onSuccess: (_, userId) => {
      // Update the outgoing requests set
      setOutgoingRequestsIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(userId);
        return newSet;
      });
      // Remove from sending set
      setSendingRequestIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      // Then invalidate the query for background refresh
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
    },
    onError: (_, userId) => {
      // Remove from sending set if there's an error
      setSendingRequestIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    },
  });
  const { mutate: acceptRequestMutation } = useMutation({
    mutationFn: (requestId) => {
      // Add the requestId to the set of accepting request IDs
      setAcceptingRequestIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(requestId);
        return newSet;
      });
      return acceptFriendRequest(requestId);
    },
    onSuccess: (_, requestId) => {
      // Find the userId associated with this requestId
      let userIdToRemove = null;
      for (const [userId, reqId] of incomingRequestsMap.entries()) {
        if (reqId === requestId) {
          userIdToRemove = userId;
          break;
        }
      }

      // Update the local state
      if (userIdToRemove) {
        setIncomingRequestsMap((prev) => {
          const newMap = new Map(prev);
          newMap.delete(userIdToRemove);
          return newMap;
        });
      }

      // Remove from accepting set
      setAcceptingRequestIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });

      // Then invalidate queries for background refresh
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (_, requestId) => {
      // Remove from accepting set if there's an error
      setAcceptingRequestIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    },
  });
  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        // Add null check to prevent errors with deleted users
        if (req && req.recipient && req.recipient._id) {
          outgoingIds.add(req.recipient._id);
        }
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);
  useEffect(() => {
    const incomingReqsMap = new Map();
    if (
      friendRequests?.incomingReqs &&
      friendRequests.incomingReqs.length > 0
    ) {
      friendRequests.incomingReqs.forEach((req) => {
        // Add null check to prevent errors with deleted users
        if (req && req.sender && req.sender._id && req._id) {
          incomingReqsMap.set(req.sender._id, req._id);
        }
      });
    }
    setIncomingRequestsMap(incomingReqsMap);
  }, [friendRequests]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-base-100 min-h-screen">
      <Helmet>
        <title>Home | Campus Founders</title>
        <meta
          name="description"
          content="Where student founders, investors, and innovators connect to build the next generation of startups."
        />
      </Helmet>
      <div className="container mx-auto space-y-10">
        <section className="mb-12 overflow-hidden">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {" "}
              <h1 className="text-xl sm:text-3xl font-bold flex items-center gap-3 mb-4">
                <UsersIcon className="text-primary h-6 w-6" />
                {getNetworkTitle()}
              </h1>
            </div>

            {loadingFriends ? (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : friends.length === 0 ? (
              <div className="card bg-base-200 p-8 text-center">
                <UsersIcon className="size-16 mx-auto opacity-30 mb-4" />
                <h3 className="text-2xl font-bold mb-2">
                  No {authUser?.role === "student" ? "investors" : authUser?.role === "investor" ? "founders" : "connections"} yet
                </h3>
                <p className="opacity-70">
                  {getNetworkEmptyMessage()}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-full overflow-x-hidden">
                {friends
                  .filter(
                    (friend) =>
                      friend &&
                      friend._id &&
                      friend.username &&
                      friend.profilePic
                  )
                  .map((friend) => (
                    <div
                      key={friend._id}
                      className="card bg-base-200 hover:shadow-lg transition-all duration-300 group relative w-full sm:w-auto max-w-[95%] sm:max-w-full mx-auto sm:mx-0"
                    >
                      {friend.bio && (
                        <div className="dropdown dropdown-hover dropdown-end absolute right-2 top-2 z-10">
                          <label
                            tabIndex={0}
                            className="btn btn-ghost btn-xs btn-circle text-base-content/70 hover:text-base-content"
                          >
                            <InfoIcon className="size-4" />
                          </label>{" "}
                          <div className="dropdown-content z-[1] card card-compact w-60 shadow-lg bg-base-100 text-base-content border-2 border-primary/20">
                            <div className="card-body">
                              <p className="text-sm">{friend.bio}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      <FriendCard friend={friend} />
                    </div>
                  ))}
              </div>
            )}
          </div>
        </section>

        {/* AI-Powered Startup Recommendations for Investors */}
        {authUser?.role === "investor" && (
          <section>
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Sparkles className="size-6 text-primary" />
                    AI-Powered Startup Recommendations
                  </h2>
                  <p className="opacity-70 mt-1">
                    Discover startups that match your investment interests and preferences
                  </p>
                </div>
              </div>
            </div>

            <AIRecommendationsSection />
          </section>
        )}

        <section>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                {" "}
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {getRecommendedTitle()}
                </h2>
                <p className="opacity-70">
                  Connect with {authUser?.role === "student" ? "investors who can help fund your vision" : authUser?.role === "investor" ? "innovative student founders" : "founders and investors"} aligned with your vision
                </p>
              </div>
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : (() => {
            const filteredUsers = recommendedUsers.filter(
              (user) =>
                user &&
                user._id &&
                user.username &&
                user.profilePic &&
                user.currentFocus
            );
            return filteredUsers.length === 0 ? (
              <div className="card bg-base-200 p-8 sm:p-12 text-center border-2 border-dashed border-base-content/20">
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-full bg-base-300 p-6">
                    <SearchIcon className="size-12 text-base-content/40" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-xl mb-2">
                      No founders found at the moment
                    </h3>
                    <p className="text-base-content opacity-70 max-w-md mx-auto">
                      {authUser?.role === "investor"
                        ? "Connect with innovative student founders aligned with your vision. Check back later for new recommendations!"
                        : authUser?.role === "student"
                          ? "Connect with investors who can help fund your vision. Check back later for new recommendations!"
                          : "Connect with founders and investors aligned with your vision. Check back later for new recommendations!"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => {
                  const hasRequestBeenSent = outgoingRequestsIds.has(user._id);
                  const incomingRequestId = incomingRequestsMap.get(user._id);
                  const hasIncomingRequest = !!incomingRequestId;

                  return (
                    <div
                      key={user._id}
                      className="card bg-base-200 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="card-body p-5 space-y-4">
                        {" "}
                        <div className="flex items-center gap-3">
                          <div className="avatar size-16 rounded-full">
                            <img
                              src={user.profilePic}
                              alt={`@${user.username}`}
                            />
                          </div>{" "}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-lg font-mono">
                                @{user.username}
                              </h3>
                              {(() => {
                                const getProfileLabel = (role) => {
                                  // Ensure we have a role value
                                  const userRole = role || user.role || "normal";
                                  switch (userRole) {
                                    case "student":
                                      return { label: "🎓 Founder", badge: "badge-accent" };
                                    case "investor":
                                      return { label: "💼 Investor", badge: "badge-info" };
                                    default:
                                      return { label: "👤 Member", badge: "badge-ghost" };
                                  }
                                };
                                const profileInfo = getProfileLabel(user.role);
                                return (
                                  <div className={`badge ${profileInfo.badge} badge-sm`}>
                                    {profileInfo.label}
                                  </div>
                                );
                              })()}
                            </div>
                            {user.location && (
                              <div className="flex items-center text-xs opacity-70 mt-1">
                                <MapPinIcon className="size-3 mr-1" />
                                {user.location}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Only show Focus, not Track */}
                        {user.currentFocus && (
                          <div className="flex flex-wrap gap-1.5">
                            <span className="badge badge-secondary">
                              {getLanguageFlag(user.currentFocus)}
                              Focus:{" "}
                              {capitialize(user.currentFocus)}
                            </span>
                          </div>
                        )}
                        {user.bio && (
                          <div className="border-l-2 border-base-300 pl-3">
                            <p className="text-sm opacity-70 line-clamp-2">
                              {user.bio}
                            </p>
                          </div>
                        )}{" "}
                        {/* Action button */}
                        {hasIncomingRequest ? (
                          <button
                            className="btn btn-accent w-full mt-2"
                            onClick={() =>
                              acceptRequestMutation(incomingRequestId)
                            }
                            disabled={acceptingRequestIds.has(
                              incomingRequestId
                            )}
                          >
                            <UserCheckIcon className="size-4 mr-2" />
                            {acceptingRequestIds.has(incomingRequestId)
                              ? "Accepting..."
                              : "Accept Request"}
                          </button>
                        ) : (
                          <button
                            className={`btn w-full mt-2 ${hasRequestBeenSent
                              ? "btn-disabled"
                              : "btn-primary"
                              }`}
                            onClick={() => sendRequestMutation(user._id)}
                            disabled={
                              hasRequestBeenSent ||
                              sendingRequestIds.has(user._id)
                            }
                          >
                            {hasRequestBeenSent ? (
                              <>
                                <CheckCircleIcon className="size-4 mr-2" />
                                Request Sent
                              </>
                            ) : (
                              <>
                                <UserPlusIcon className="size-4 mr-2" />
                                {sendingRequestIds.has(user._id)
                                  ? "Sending..."
                                  : "Send Friend Request"}
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
