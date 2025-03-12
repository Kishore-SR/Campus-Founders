import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/NavBar/NavBar";
import  Home  from "./pages/Home/Home";
import Discover from "./pages/Discover/Discover";
import  {MyStartup}  from "./pages/MyStartup/MyStartup";
import { HelmetProvider } from "react-helmet-async";
import Login from "./pages/Login";

import NotFound from "./pages/NotFound/NotFound";

export const App = () => {
  return (
    <HelmetProvider>
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/mystartup" element={<MyStartup />} />
            <Route path="/login" element={<Login />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          <Navbar />
        </div>
      </Router>
    </HelmetProvider>
  );
};
