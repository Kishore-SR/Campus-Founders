import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { Atom, BellIcon, HomeIcon, UsersIcon, RocketIcon, TrendingUpIcon, UserIcon, FileText, Crown, BookOpen } from "lucide-react";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-base-300">
        <Link to="/home" className="flex items-center gap-2.5">
          <Atom className="size-9 text-primary" />
          <span className="text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
            Campus Founders
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <Link
          to="/home"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/home" ? "btn-active" : ""
            }`}
        >
          <HomeIcon className="size-5 text-base-content opacity-70" />
          <span>Home</span>
        </Link>

        <Link
          to="/startups"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/startups" ? "btn-active" : ""
            }`}
        >
          <RocketIcon className="size-5 text-base-content opacity-70" />
          <span>Startups</span>
        </Link>

        <Link
          to="/investors"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/investors" ? "btn-active" : ""
            }`}
        >
          <TrendingUpIcon className="size-5 text-base-content opacity-70" />
          <span>Investors</span>
        </Link>

        <Link
          to="/resources"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath.startsWith("/resources") ? "btn-active" : ""
            }`}
        >
          <BookOpen className="size-5 text-base-content opacity-70" />
          <span>Resources</span>
        </Link>

        {/* Govt Schemes - Only for Founders */}
        {authUser?.role === "student" && (
          <Link
            to="/govt-schemes"
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/govt-schemes" ? "btn-active" : ""
              }`}
          >
            <FileText className="size-5 text-base-content opacity-70" />
            <span>Govt. Schemes</span>
          </Link>
        )}

        <div className="divider my-2"></div>

        <Link
          to="/profile"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/profile" ? "btn-active" : ""
            }`}
        >
          <UserIcon className="size-5 text-base-content opacity-70" />
          <span>My Profile</span>
        </Link>

        <Link
          to="/premium"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/premium" ? "btn-active" : ""
            }`}
        >
          <Crown className={`size-5 ${authUser?.isPremium ? 'text-warning' : 'text-base-content opacity-70'}`} fill={authUser?.isPremium ? 'currentColor' : 'none'} />
          <span>Premium</span>
        </Link>

        <Link
          to="/connections"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/connections" ? "btn-active" : ""
            }`}
        >
          <UsersIcon className="size-5 text-base-content opacity-70" />
          <span>Connections</span>
        </Link>

        <Link
          to="/notifications"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/notifications" ? "btn-active" : ""
            }`}
        >
          <BellIcon className="size-5 text-base-content opacity-70" />
          <span>Notifications</span>
        </Link>
      </nav>

      {/* USER PROFILE SECTION */}
      <div className="p-4 border-t border-base-300 mt-auto">
        <Link to="/profile" className="flex items-center gap-3 hover:bg-base-300 p-2 rounded-lg transition-colors">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1 overflow-hidden">
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
          <div className="flex-1">
            <p className="font-semibold text-sm flex items-center gap-1">
              @{authUser?.username}
              {authUser?.isPremium && (
                <Crown className="size-4 text-warning" fill="currentColor" />
              )}
            </p>
            <p className="text-xs text-success flex items-center gap-1">
              <span className="size-2 rounded-full bg-success inline-block" />
              Online
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
};
export default Sidebar;
