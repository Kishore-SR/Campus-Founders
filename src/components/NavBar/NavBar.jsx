import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser, UserButton } from "@clerk/clerk-react";
import "./NavBar.css";

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      {/* Desktop Top Navbar */}
      <nav className="top-navbar">
        <div className="logo-title">
          <img src="/logo.gif" alt="Logo" className="logo" />
          <span className="title">Top Hackathons</span>
        </div>
        <div className="nav-links">
          <Link to="/" className={`nav-item ${location.pathname === "/" ? "active" : ""}`}>
            <i className="ri-home-5-line"></i>
            <span>Home</span>
          </Link>
          <Link to="/explore" className={`nav-item ${location.pathname === "/explore" ? "active" : ""}`}>
            <i className="ri-search-line"></i>
            <span>Explore</span>
          </Link>
          <Link to="/tools" className={`nav-item ${location.pathname === "/tools" ? "active" : ""}`}>
            <i className="ri-function-add-line"></i>
            <span>Tools</span>
          </Link>
          {/* Profile Link (Dynamic based on login state) */}
          {isSignedIn ? (
            <div className="nav-item" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <UserButton />
              <span>{user.firstName}</span>
            </div>
          ) : (
            <div className="nav-item" onClick={() => navigate("/login")}>
              <i className="ri-user-star-line"></i>
              <span>Profile</span>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Navbar */}
      <nav className="bottom-navbar">
        <Link to="/" className={`nav-item ${location.pathname === "/" ? "active" : ""}`}>
          <i className="ri-home-5-line"></i>
          <span>Home</span>
        </Link>
        <Link to="/explore" className={`nav-item ${location.pathname === "/explore" ? "active" : ""}`}>
          <i className="ri-search-line"></i>
          <span>Explore</span>
        </Link>
        <Link to="/tools" className={`nav-item ${location.pathname === "/tools" ? "active" : ""}`}>
          <i className="ri-function-add-line"></i>
          <span>Tools</span>
        </Link>
        {/* Profile Link (Dynamic based on login state) */}
        {isSignedIn ? (
          <div className="nav-item" style={{ display: "flex", alignItems: "center", gap: "0" }}>
            <UserButton />
            <span>{user.firstName}</span>
          </div>
        ) : (
          <div className="nav-item" onClick={() => navigate("/login")}>
            <i className="ri-user-star-line"></i>
            <span>Profile</span>
          </div>
        )}
      </nav>
    </>
  );
};
