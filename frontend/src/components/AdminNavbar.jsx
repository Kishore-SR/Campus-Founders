import { Link, useLocation } from "react-router";
import { Shield, LayoutDashboard, Users, Briefcase, UserCheck, LogOutIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";

const AdminNavbar = () => {
  const location = useLocation();
  const { logoutMutation, isPending: isLoggingOut } = useLogout();
  const currentPath = location.pathname;

  const adminLinks = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/users", label: "Users", icon: Users },
    { path: "/admin/startups", label: "Startups", icon: Briefcase },
    { path: "/admin/investors", label: "Investors", icon: UserCheck },
  ];

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Mobile Layout */}
        <div className="flex items-center justify-between w-full sm:hidden">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <Shield className="size-6 text-primary" />
            <span className="text-lg font-bold">Admin</span>
          </Link>

          <div className="flex items-center gap-1">
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

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between w-full">
          {/* Left: Admin Branding */}
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <Shield className="size-7 text-primary" />
            <span className="text-xl font-bold">Admin</span>
          </Link>

          {/* Center: Navigation Links */}
          <div className="flex items-center gap-2">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentPath === link.path ||
                (link.path === "/admin/dashboard" && currentPath === "/admin/dashboard") ||
                (link.path === "/admin/startups" && currentPath.startsWith("/admin/startups")) ||
                (link.path === "/admin/investors" && currentPath.startsWith("/admin/investors")) ||
                (link.path === "/admin/users" && currentPath.startsWith("/admin/users"));

              return (
                <Link key={link.path} to={link.path}>
                  <button
                    className={`btn btn-ghost btn-sm gap-2 ${isActive ? "btn-active" : ""
                      }`}
                  >
                    <Icon className="size-4" />
                    <span className="hidden md:inline">{link.label}</span>
                  </button>
                </Link>
              );
            })}
          </div>

          {/* Right: Theme & Logout */}
          <div className="flex items-center gap-3">
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

export default AdminNavbar;

