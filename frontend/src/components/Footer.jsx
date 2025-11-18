import { Link } from "react-router";
import { Atom, Github, Linkedin, Mail, Twitter } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-base-200 border-t border-base-300 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <Atom className="size-8 text-primary" />
              <span className="text-xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                Campus Founders
              </span>
            </Link>
            <p className="text-sm opacity-70">
              Connecting student founders with investors to build the next generation of startups.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-circle btn-sm"
                aria-label="GitHub"
              >
                <Github className="size-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-circle btn-sm"
                aria-label="Twitter"
              >
                <Twitter className="size-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-circle btn-sm"
                aria-label="LinkedIn"
              >
                <Linkedin className="size-5" />
              </a>
              <a
                href="mailto:contact@campusfounders.com"
                className="btn btn-ghost btn-circle btn-sm"
                aria-label="Email"
              >
                <Mail className="size-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="text-sm opacity-70 hover:opacity-100 hover:text-primary transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-sm opacity-70 hover:opacity-100 hover:text-primary transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <a href="#features" className="text-sm opacity-70 hover:opacity-100 hover:text-primary transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#about" className="text-sm opacity-70 hover:opacity-100 hover:text-primary transition-colors">
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* For Founders */}
          <div>
            <h3 className="font-bold text-lg mb-4">For Founders</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm opacity-70 hover:opacity-100 hover:text-primary transition-colors">
                  Discover Investors
                </a>
              </li>
              <li>
                <a href="#" className="text-sm opacity-70 hover:opacity-100 hover:text-primary transition-colors">
                  Government Schemes
                </a>
              </li>
              <li>
                <a href="#" className="text-sm opacity-70 hover:opacity-100 hover:text-primary transition-colors">
                  Startup Resources
                </a>
              </li>
              <li>
                <a href="#" className="text-sm opacity-70 hover:opacity-100 hover:text-primary transition-colors">
                  Get Funded
                </a>
              </li>
            </ul>
          </div>

          {/* For Investors */}
          <div>
            <h3 className="font-bold text-lg mb-4">For Investors</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm opacity-70 hover:opacity-100 hover:text-primary transition-colors">
                  Discover Startups
                </a>
              </li>
              <li>
                <a href="#" className="text-sm opacity-70 hover:opacity-100 hover:text-primary transition-colors">
                  AI Recommendations
                </a>
              </li>
              <li>
                <a href="#" className="text-sm opacity-70 hover:opacity-100 hover:text-primary transition-colors">
                  Investment Opportunities
                </a>
              </li>
              <li>
                <a href="#" className="text-sm opacity-70 hover:opacity-100 hover:text-primary transition-colors">
                  Connect with Founders
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-base-300 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm opacity-70 text-center sm:text-left">
            © {currentYear} Campus Founders. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm opacity-70">
            <a href="#" className="hover:opacity-100 hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:opacity-100 hover:text-primary transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

