import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div style={{ textAlign: "center", padding: "50px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: "32px", color: "#333" }}>404 - Page Not Found</h1>
      <p style={{ fontSize: "18px", color: "#666" }}>The page you are looking for does not exist.</p>
      <Link to="/" style={{ textDecoration: "none", color: "#01b72f", fontSize: "18px", fontWeight: "bold" }}>
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
