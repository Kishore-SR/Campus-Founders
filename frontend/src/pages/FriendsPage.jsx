import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import { getUserFriends } from "../lib/api";
import { getLanguageFlag } from "../components/FriendCard";
import toast from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";
import {
  MessageSquareIcon,
  VideoIcon,
  UserX2Icon,
  SearchIcon,
  UsersIcon,
  FilterIcon,
} from "lucide-react";
import { Helmet } from "react-helmet-async";

const FriendsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const { authUser } = useAuthUser();
  const _queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
    onSuccess: (data) => console.log("Friends data:", data),
  });
  const filteredFriends = friends.filter((friend) => {
    // First filter out any null or invalid friend objects
    if (
      !friend ||
      !friend._id ||
      !friend.username ||
      !friend.currentFocus
    ) {
      return false;
    }

    const matchesSearch = (friend.fullName || friend.username || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesLanguage =
      selectedLanguage === "all" ||
      friend.currentFocus?.toLowerCase() === selectedLanguage.toLowerCase();

    return matchesSearch && matchesLanguage;
  });
  const languages = [
    ...new Set(
      friends
        .filter((friend) => friend && friend._id && friend.currentFocus)
        .map((friend) => friend.currentFocus)
        .filter(Boolean)
    ),
  ];
  const handleVideoCall = async (friend) => {
    // TODO: Revert to actual implementation when video call limits are resolved
    // Demo video call link - open in new tab with actual username
    const userId = authUser?.username || authUser?.fullName?.replace(/\s+/g, "_") || authUser?._id || "User";
    const demoCallUrl = `https://getstream.io/video/demos/join/JRcWJUMVmWdqGYdRqIr5g?user_id=${encodeURIComponent(userId)}`;
    window.open(demoCallUrl, "_blank");

    /* COMMENTED OUT - Actual implementation (to revert later)
    if (!friend || !friend._id || !friend.username) {
      toast.error("Cannot start call with invalid user");
      return;
    }

    if (!authUser) {
      toast.error("You need to be logged in to start a call");
      return;
    }

    if (!authUser.isPremium) {
      toast.error("Premium subscription required for video calls");
      navigate("/premium");
      return;
    }

    // Create channel ID same way as in ChatPage
    const channelId = [authUser._id, friend._id].sort().join("-");

    // Navigate directly to the call page - it will handle initialization
    navigate(`/call/${channelId}`);
    */
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-base-100 min-h-screen">
      <Helmet>
        <title>Connections | Campus Founders</title>
        <meta
          name="description"
          content="Connect with founders, investors, and members on Campus Founders."
        />
      </Helmet>
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            {" "}
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <UsersIcon className="text-primary h-7 w-7" />
              Your Network
              <span className="badge badge-primary ml-2">{friends.length}</span>
            </h1>
            <p className="text-sm opacity-70 mt-1">
              Connect and collaborate with founders, investors, and members
            </p>
          </div>
        </div>
        {/* Search and filters */}
        <div className="bg-base-200 rounded-xl p-4 shadow-md">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 h-5 w-5" />
              <input
                type="text"
                placeholder="Search connections by name..."
                className="input input-bordered w-full pl-10 bg-base-100 placeholder:opacity-40"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="btn btn-outline gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterIcon className="h-4 w-4" />
              Filter
            </button>
          </div>{" "}
          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-base-300">
              <span className="text-sm font-medium mr-2">
                Filter by focus/track:
              </span>
              <button
                className={`btn btn-sm ${selectedLanguage === "all" ? "btn-primary" : "btn-outline"
                  }`}
                onClick={() => setSelectedLanguage("all")}
              >
                All
              </button>
              {languages.map((language) => (
                <button
                  key={language}
                  className={`btn btn-sm ${selectedLanguage === language.toLowerCase()
                    ? "btn-primary"
                    : "btn-outline"
                    }`}
                  onClick={() => setSelectedLanguage(language.toLowerCase())}
                >
                  {getLanguageFlag(language)} {language}
                </button>
              ))}
            </div>
          )}
        </div>{" "}
        {/* Friend cards */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="text-center py-16 bg-base-200 rounded-xl shadow-inner">
            <UserX2Icon className="mx-auto h-16 w-16 text-base-content/30" />
            <h3 className="mt-4 text-xl font-semibold">No connections found</h3>
            <p className="mt-2 text-base-content/70">
              {searchTerm || selectedLanguage !== "all"
                ? "Try changing your search or filter settings"
                : "Connect with founders, investors, and members to see them here"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredFriends.map((friend) => (
              <div
                key={friend._id}
                className="flex bg-base-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-primary/25 border-l-4 border-l-primary"
              >
                {/* Profile Picture Column */}
                <div className="w-1/3 bg-gradient-to-br from-primary/20 to-secondary/20 p-6 flex items-center justify-center">
                  <div className="avatar">
                    <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                      {friend.profilePic && friend.profilePic.trim() ? (
                        <img
                          src={friend.profilePic}
                          alt={friend.fullName || friend.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl w-full h-full">
                          {friend.fullName?.charAt(0) || friend.username?.charAt(0) || "U"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Content Column */}
                <div className="w-2/3 p-6">
                  <div className="flex flex-col h-full justify-between">
                    {/* User Info */}
                    <div>
                      <h3 className="text-xl font-bold mb-2">
                        {friend.fullName || friend.username}
                      </h3>
                      {/* Role badge and Focus on same line */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        {(() => {
                          const getProfileLabel = (role) => {
                            // Ensure we have a role value
                            const userRole = role || friend.role || "normal";
                            switch (userRole) {
                              case "student":
                                return { label: "🎓 Founder", badgeClass: "badge-accent" };
                              case "investor":
                                return { label: "💼 Investor", badgeClass: "badge-info" };
                              default:
                                return { label: "👤 Member", badgeClass: "badge-primary" };
                            }
                          };
                          const profileInfo = getProfileLabel(friend.role);
                          return (
                            <span className={`badge ${profileInfo.badgeClass} text-xs`}>
                              {profileInfo.label}
                            </span>
                          );
                        })()}
                        {friend.currentFocus && (
                          <span className="badge badge-secondary text-xs">
                            {getLanguageFlag(friend.currentFocus)}
                            <span className="font-bold">Focus</span>: {friend.currentFocus}
                          </span>
                        )}
                      </div>
                      {friend.bio && (
                        <div className="mt-2 mb-3 bg-base-100 rounded-lg p-2 border-l-2 border-secondary">
                          <p className="text-sm italic opacity-80">
                            "{friend.bio}"
                          </p>
                        </div>
                      )}
                    </div>
                    {/* Action Buttons */}
                    <div className="flex gap-8">
                      <button
                        onClick={() => {
                          if (!authUser?.isPremium) {
                            toast.error("Premium subscription required for chat");
                            navigate("/premium");
                          } else {
                            navigate(`/chat/${friend._id}`);
                          }
                        }}
                        className="btn btn-primary btn-sm flex-1"
                      >
                        <MessageSquareIcon className="h-4 w-4 mr-2" />
                        Chat
                      </button>
                      {/* Updated video call button */}
                      <button
                        onClick={() => handleVideoCall(friend)}
                        className="btn btn-outline btn-sm flex-1"
                      >
                        <VideoIcon className="h-4 w-4 mr-2" />
                        Call
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
