import React from "react";
import { Helmet } from "react-helmet-async";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptFriendRequest, getFriendRequests } from "../lib/api";
import {
  BellIcon,
  ClockIcon,
  MessageSquareIcon,
  UserCheckIcon,
} from "lucide-react";
import NoNotificationsFound from "../components/NoNotificationsFound";
import { Link } from "react-router";

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  const { data: friendRequests, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const incomingRequests = friendRequests?.incomingReqs || [];
  const acceptedRequests = friendRequests?.acceptedReqs || [];
  return (
    <div className="p-4 sm:p-6 h-full bg-base-100">
      {" "}
      <Helmet>
        <title>Notifications</title>
        <meta
          name="description"
          content="Stay updated with your Campus Founders connections and activities."
        />
      </Helmet>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">
          Notifications
        </h1>{" "}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="space-y-8">
            {incomingRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <UserCheckIcon className="h-5 w-5 text-primary" />
                  Connection Requests
                  <span className="badge badge-primary ml-2">
                    {incomingRequests.length}
                  </span>
                </h2>{" "}
                <div className="space-y-3">
                  {incomingRequests
                    .filter(
                      (request) =>
                        request && request.sender && request.sender._id
                    )
                    .map((request) => (
                      <div
                        key={request._id}
                        className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow border border-primary/25"
                      >
                        <div className="card-body p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {" "}
                              <div className="avatar">
                                <div className="w-14 h-14 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1 overflow-hidden">
                                  {request.sender.profilePic && request.sender.profilePic.trim() ? (
                                    <img
                                      src={request.sender.profilePic}
                                      alt={request.sender.fullName || request.sender.username}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold w-full h-full">
                                      {request.sender.fullName?.charAt(0) || request.sender.username?.charAt(0) || "U"}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h3 className="font-semibold mb-1">
                                  {request.sender.fullName || request.sender.username}
                                </h3>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {(() => {
                                    const getProfileLabel = (role) => {
                                      const userRole = role || request.sender.role || "normal";
                                      switch (userRole) {
                                        case "student":
                                          return { label: "🎓 Founder", badgeClass: "badge-accent" };
                                        case "investor":
                                          return { label: "💼 Investor", badgeClass: "badge-info" };
                                        default:
                                          return { label: "👤 Member", badgeClass: "badge-primary" };
                                      }
                                    };
                                    const profileInfo = getProfileLabel(request.sender.role);
                                    return (
                                      <span className={`badge ${profileInfo.badgeClass} text-xs`}>
                                        {profileInfo.label}
                                      </span>
                                    );
                                  })()}
                                  {request.sender.currentFocus && (
                                    <span className="badge badge-secondary text-xs">
                                      <span className="font-bold">Focus</span>: {request.sender.currentFocus}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => acceptRequestMutation(request._id)}
                              disabled={isPending}
                            >
                              Accept
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}{" "}
            {/* ACCEPTED REQS NOTIFICATONS */}
            {acceptedRequests &&
              acceptedRequests.filter(
                (notification) =>
                  notification &&
                  notification.recipient &&
                  notification.recipient._id
              ).length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <BellIcon className="h-5 w-5 text-success" />
                    New Connections
                  </h2>{" "}
                  <div className="space-y-3">
                    {acceptedRequests
                      .filter(
                        (notification) =>
                          notification &&
                          notification.recipient &&
                          notification.recipient._id
                      )
                      .map((notification) => (
                        <div
                          key={notification._id}
                          className="card bg-base-200 shadow-sm border border-primary/25"
                        >
                          {" "}
                          <div className="card-body p-4">
                            {/* Badge positioned absolutely for mobile and desktop */}
                            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 sm:mb-14">
                              <div className="badge badge-success">
                                <UserCheckIcon className="h-3 w-3 mr-1" />
                                New Connection
                              </div>
                            </div>

                            {/* Mobile-friendly notification layout */}
                            <div className="flex flex-col sm:flex-row gap-4">
                              {/* User info section */}
                              <div className="flex gap-3">
                                <div className="avatar">
                                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1 overflow-hidden">
                                    {notification.recipient.profilePic && notification.recipient.profilePic.trim() ? (
                                      <img
                                        src={notification.recipient.profilePic}
                                        alt={notification.recipient.fullName || notification.recipient.username}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold w-full h-full">
                                        {notification.recipient.fullName?.charAt(0) || notification.recipient.username?.charAt(0) || "U"}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  {" "}
                                  <h3 className="font-semibold mb-1">
                                    {notification.recipient.fullName || notification.recipient.username}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                    {(() => {
                                      const getProfileLabel = (role) => {
                                        const userRole = role || notification.recipient.role || "normal";
                                        switch (userRole) {
                                          case "student":
                                            return { label: "🎓 Founder", badgeClass: "badge-accent" };
                                          case "investor":
                                            return { label: "💼 Investor", badgeClass: "badge-info" };
                                          default:
                                            return { label: "👤 Member", badgeClass: "badge-primary" };
                                        }
                                      };
                                      const profileInfo = getProfileLabel(notification.recipient.role);
                                      return (
                                        <span className={`badge ${profileInfo.badgeClass} text-xs`}>
                                          {profileInfo.label}
                                        </span>
                                      );
                                    })()}
                                    {notification.recipient.currentFocus && (
                                      <span className="badge badge-secondary text-xs">
                                        <span className="font-bold">Focus</span>: {notification.recipient.currentFocus}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm my-1">
                                    Accepted your connection request
                                  </p>
                                  <p className="text-xs flex items-center opacity-70 mb-4">
                                    <ClockIcon className="h-3 w-3 mr-1" />
                                    Recently
                                  </p>
                                </div>
                              </div>

                              {/* Message button - full width on mobile, auto on desktop */}
                              <div className="mt-0 sm:mt-6 sm:self-center sm:ml-auto sm:gap-16">
                                <Link
                                  to={`/chat/${notification.recipient._id}`}
                                  className="btn btn-primary btn-sm w-full sm:w-auto"
                                >
                                  <MessageSquareIcon className="h-4 w-4 mr-1" />
                                  Message
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>
              )}{" "}
            {(!incomingRequests || incomingRequests.length === 0) &&
              (!acceptedRequests ||
                acceptedRequests.filter(
                  (notification) =>
                    notification &&
                    notification.recipient &&
                    notification.recipient._id
                ).length === 0) && <NoNotificationsFound />}
          </div>
        )}
      </div>
    </div>
  );
};
export default NotificationsPage;
