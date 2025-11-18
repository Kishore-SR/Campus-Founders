import { Link } from "react-router";
import { Atom } from "lucide-react";
import ThemeSelector from "./ThemeSelector";

const LandingNavbar = () => {
  return (
    <nav className="bg-base-200/80 backdrop-blur-sm border-b border-base-300 sticky top-0 z-50 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <Atom className="size-8 sm:size-9 text-primary" />
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              Campus Founders
            </span>
          </Link>

          {/* Right side: Theme selector and Login */}
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeSelector />
            <Link
              to="/login"
              className="btn btn-primary !h-9 sm:!h-10 !px-4 sm:!px-6 !py-1.5 sm:!py-2 text-sm font-medium rounded-lg min-h-0"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;

