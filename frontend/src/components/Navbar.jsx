import { Link, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAuthUser from "../hooks/useAuthUser";
import { Atom, BellIcon, LogOutIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";
import { getFriendRequests } from "../lib/api";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");
  const isNotificationsPage = location.pathname === "/notifications";
  const [showNotificationBadge, setShowNotificationBadge] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Get logout state with isPending to show loading indicator
  const { logoutMutation, isPending: isLoggingOut } = useLogout();

  // Fetch notifications
  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });
  // Store which notifications have been seen
  const [viewedAcceptedIds, setViewedAcceptedIds] = useState([]);

  useEffect(() => {
    if (friendRequests) {
      const incomingCount = friendRequests.incomingReqs?.length || 0;

      const newAcceptedReqs =
        friendRequests.acceptedReqs?.filter(
          (req) => !viewedAcceptedIds.includes(req._id)
        ) || [];
      const acceptedCount = newAcceptedReqs.length;

      const totalCount = incomingCount + acceptedCount;
      setNotificationCount(totalCount);
      setShowNotificationBadge(totalCount > 0 && !isNotificationsPage);
    }
  }, [friendRequests, isNotificationsPage, viewedAcceptedIds]);

  useEffect(() => {
    if (isNotificationsPage && friendRequests) {
      const acceptedIds =
        friendRequests.acceptedReqs?.map((req) => req._id) || [];
      if (acceptedIds.length > 0) {
        setViewedAcceptedIds((prev) => [...prev, ...acceptedIds]);
      }
      setShowNotificationBadge(false);
    }
  }, [isNotificationsPage, friendRequests]);

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* ----- Mobile Layout (profile left, icons right) ----- */}
        <div className="flex items-center justify-between w-full sm:hidden">
          {/* Profile pic on left */}
          <Link to="/home">
            <div className="flex rows items-center gap-2">
              <div className="avatar">
                <div className="w-11 h-11 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1 overflow-hidden">
                  {authUser?.profilePic && authUser.profilePic.trim() ? (
                    <img
                      src={authUser.profilePic}
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm w-full h-full">
                      {authUser?.fullName?.charAt(0) || authUser?.username?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
              </div>
              {/* Display username in mobile view */}
              <div className="mr-2">
                <div className="text-sm font-mono font-semibold opacity-80">
                  @{authUser?.username || ""}
                </div>
              </div>
            </div>
          </Link>{" "}
          {/* Right side icons */}
          <div className="flex items-center gap-1">
            <Link to={"/notifications"}>
              <button className="btn btn-ghost btn-circle relative">
                <BellIcon className="h-6 w-6 text-base-content opacity-70" />
                {showNotificationBadge && (
                  <span className="absolute -top-0 -right-0 bg-error text-error-content text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </button>
            </Link>

            <ThemeSelector />

            <button
              className="btn btn-ghost btn-circle relative"
              onClick={logoutMutation}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
              )}
            </button>
          </div>
        </div>

        {/* ----- Desktop Layout ----- */}
        <div className="hidden sm:flex items-center justify-end w-full">
          {/* Logo - only in the chat page */}
          {isChatPage && (
            <div className="pl-5 mr-auto">
              <Link to="/home" className="flex items-center gap-2.5">
                <Atom className="size-9 text-primary" />
                <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                  Campus Founders
                </span>
              </Link>
            </div>
          )}{" "}
          {/* Right-side icons */}
          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            <Link to={"/notifications"}>
              <button className="btn btn-ghost btn-circle relative">
                <BellIcon className="h-6 w-6 text-base-content opacity-70" />
                {showNotificationBadge && (
                  <span className="absolute -top-0 -right-0 bg-error text-error-content text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </button>
            </Link>

            <ThemeSelector />

            <button
              className="btn btn-ghost btn-circle relative"
              onClick={logoutMutation}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
